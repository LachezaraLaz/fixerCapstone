const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Quotes } = require('../model/quoteModel');
const Notification = require('../model/notificationModel');
const { fixerClient } = require('../model/fixerClientModel');
const { Jobs } = require('../model/createIssueModel');
const { logger } = require('../utils/logger');
const { initChat } = require('./initChat');

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // console.log('Token received:', token); // Log the token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // console.log('User data from token:', user); // Log user data
        req.user = user;
        next();
    });
};

// POST /quotes/create route to create a new quote
const submitQuote = async (req, res) => {
    console.log('User data in submitQuote:', req.user); // Log the user data

    const { clientEmail, price, issueId } = req.body;

    if (!clientEmail || !price || !issueId) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const professionalEmail = req.user.email; // This should come from req.user if it's set correctly

        if (!professionalEmail) {
            return res.status(400).json({ message: 'Professional email not found.' });
        }

        // Check if a quote already exists
        const existingQuote = await Quotes.findOne({ issueId, professionalEmail });
        if (existingQuote) {
            return res.status(400).json({ message: 'You have already submitted a quote for this issue.' });
        }

        // Fetch client information
        const clientInfo = await fixerClient.findOne({ email: clientEmail });
        if (!clientInfo) {
            return res.status(404).json({ message: 'Client information not found' });
        }

        // Fetch the issue to get the title
        const issue = await Jobs.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found.' });
        }

        const newQuote = await Quotes.create({
            professionalEmail,
            clientEmail,
            price,
            issueId,
        });

        // Create a notification for the quote
        const notification = new Notification({
            userId: clientInfo._id,  // Use the client's ID
            message: `Your issue titled "${issue.title}" has received a new quote.`,
            isRead: false
        });
        await notification.save();
        logger.info("new quote has been created for issue number:", issueId, "and a notification has been sent to the client");

        res.status(201).json({ message: 'Quote created successfully', quote: newQuote });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /quotes/job/:jobId route to fetch quotes for a specific job
const getQuotesByJob = async (req, res) => {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: 'Invalid job ID.' });
    }

    try {
        // Only fetch quotes that are not rejected
        const quotes = await Quotes.find({ issueId: jobId, status: { $ne: 'rejected' } }).lean();

        const populatedQuotes = await Promise.all(
            quotes.map(async (quote) => {
                const professional = await fixerClient.findOne({ email: quote.professionalEmail });
                if (professional) {
                    return {
                        ...quote,
                        professionalFullName: `${professional.firstName} ${professional.lastName}`,
                    };
                }
                return quote;
            })
        );

        res.status(200).json({ offers: populatedQuotes || [] });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ message: 'Error fetching quotes for the job.' });
    }
};

// GET /quotes/:quoteId route to update quotes status
const updateQuoteStatus = async (req, res) => {
    const { quoteId } = req.params;
    const { status, agreedAmount } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        // Fetch the quote to get the associated job (issueId)
        const quote = await Quotes.findById(quoteId);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found.' });
        }

        if (status === 'accepted') {
            // Store the agreed amount
            quote.agreedAmount = agreedAmount;
            await quote.save();

            // Accept quote
            const updatedQuote = await Quotes.findByIdAndUpdate(
                quoteId,
                { status },
                { new: true }
            );

            if (!updatedQuote) {
                return res.status(404).json({ message: 'Failed to update the quote.' });
            }

            // Update the status of the associated issue to "in progress"
            await Jobs.findByIdAndUpdate(quote.issueId, { status: 'In progress' });
            logger.info("issue number", quote.issueId, "has been updated to in progress because the client accepted a quote");

            // Automatically reject all other quotes for the same job
            await Quotes.updateMany(
                { issueId: quote.issueId, _id: { $ne: quoteId } },
                { status: 'rejected' }
            );
            logger.info("all other quotes were rejected");

            // Fetch related information for notification
            const professional = await fixerClient.findOne({ email: updatedQuote.professionalEmail });
            const issue = await Jobs.findById(updatedQuote.issueId);

            if (!professional || !issue) {
                return res.status(404).json({ message: 'Professional or issue not found.' });
            }

            // Notify the professional whose quote was accepted
            const notification = new Notification({
                userId: professional._id, // Professional's ID
                message: `Your quote for the job titled "${issue.title}" has been accepted. The job is now in progress.`,
                isRead: false,
            });
            await notification.save();
            logger.info("the accepted quote received a notification");

            // initChat
            const clientId = req.user.id;
            await initChat(issue.title, clientId, professional._id.toString());

            // Notify other professionals whose quotes were rejected
            const otherProfessionals = await Quotes.find({
                issueId: quote.issueId,
                status: 'rejected',
            }).populate('professionalEmail');

            for (const rejectedQuote of otherProfessionals) {
                const rejectedProfessional = await fixerClient.findOne({ email: rejectedQuote.professionalEmail });
                if (rejectedProfessional) {
                    const rejectionNotification = new Notification({
                        userId: rejectedProfessional._id,
                        message: `Your quote for the job titled "${issue.title}" has been rejected.`,
                        isRead: false,
                    });
                    await rejectionNotification.save();
                }
            }

            logger.info("the rejected quotes received a notification");
            res.status(200).json({ message: `Quote accepted, others rejected and job updated to "in progress".`, quote: updatedQuote });
        } else if (status === 'rejected') {
            // Handle manual rejection of a quote
            const updatedQuote = await Quotes.findByIdAndUpdate(
                quoteId,
                { status },
                { new: true }
            );

            if (!updatedQuote) {
                return res.status(404).json({ message: 'Failed to update the quote.' });
            }

            // Notify the professional whose quote was rejected
            const professional = await fixerClient.findOne({ email: updatedQuote.professionalEmail });
            const issue = await Jobs.findById(updatedQuote.issueId);

            if (!professional || !issue) {
                return res.status(404).json({ message: 'Professional or issue not found.' });
            }

            const notification = new Notification({
                userId: professional._id, // Professional's ID
                message: `Your quote for the job titled "${issue.title}" has been rejected.`,
                isRead: false,
            });
            await notification.save();

            logger.info("a rejected quote received a notification for issue number", issueId);
            res.status(200).json({ message: `Quote rejected successfully.`, quote: updatedQuote });
        }
    } catch (error) {
        console.error('Error updating quote status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { authenticateJWT, submitQuote, getQuotesByJob, updateQuoteStatus };