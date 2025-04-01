const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Quotes } = require('../model/quoteModel');
const Notification = require('../model/notificationModel');
const { fixerClient } = require('../model/fixerClientModel');
const { Jobs } = require('../model/createIssueModel');
const { logger } = require('../utils/logger');
const { initChat } = require('./initChat');


/**
 * @module server/controller
 */

/**
 * Middleware to authenticate JWT token from the request headers.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {Object} req.headers.authorization - The authorization header containing the JWT token.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * 
 * @returns {Object} - Returns a 401 status with a message 'Unauthorized' if the authorization header or token is missing.
 *                     Returns a 403 status with a message 'Forbidden' if the token verification fails.
 *                     Calls the next middleware function if the token is successfully verified.
 */
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

/**
 * Handles the submission of a quote by a professional.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing the professional's information.
 * @param {string} req.user.email - The professional's email.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.clientEmail - The client's email.
 * @param {number} req.body.price - The price of the quote.
 * @param {string} req.body.issueId - The ID of the issue.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
const submitQuote = async (req, res) => {
    console.log('User data in submitQuote:', req.user); // Log the user data

    const {
        clientEmail,
        issueTitle,
        price,
        issueId,
        jobDescription,
        toolsMaterials,
        termsConditions,
    } = req.body;

    if (!clientEmail || !issueTitle || !price || !issueId || !jobDescription || !toolsMaterials ) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const professionalEmail = req.user.email; // This should come from req.user if it's set correctly

        if (!professionalEmail) {
            return res.status(400).json({ message: 'Professional email not found.' });
        }

        console.log("Received issue ID from request:", issueId);
        const convertedIssueId = new mongoose.Types.ObjectId(issueId);
        console.log("Converted issue ID to ObjectId:", convertedIssueId);

        // Check if a quote already exists
        const existingQuote = await Quotes.findOne({ issueId: convertedIssueId, professionalEmail });

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

        // Create a new quote with the extended attributes
        const newQuote = await Quotes.create({
            professionalEmail,
            clientEmail,
            issueTitle,
            price,
            issueId,
            jobDescription,
            toolsMaterials,
            termsConditions,
        });

        // Create a notification for the quote
        const notification = new Notification({
            userId: clientInfo._id,  // Use the client's ID
            message: `🎉 Congrats! Your issue titled "${issue.title}" has received a new quote.`,
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

/**
 * Fetches quotes for a specific job that are not rejected and populates them with professional's full name.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.jobId - The ID of the job to fetch quotes for.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the quotes are fetched and the response is sent.
 */
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

/**
 * Updates the status of a quote and performs related actions such as notifying professionals and updating job status.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.quoteId - The ID of the quote to update.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.status - The new status of the quote ('accepted' or 'rejected').
 * @param {Object} req.user - The authenticated user making the request.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 *
 * @throws {Error} - Throws an error if there is an issue updating the quote status.
 */
const updateQuoteStatus = async (req, res) => {
    const { quoteId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        // Fetch the quote to get the associated job (issueId)
        const quote = await Quotes.findById(quoteId);
        const profEmail = quote.professionalEmail;

        if (!quote) {
            return res.status(404).json({ message: 'Quote not found.' });
        }

        if (status === 'accepted') {
            // Accept quote
            const updatedQuote = await Quotes.findByIdAndUpdate(
                quoteId,
                { status },
                { new: true }
            );

            if (!updatedQuote) {
                return res.status(404).json({ message: 'Failed to update the quote.' });
            }

            // Before updating, check if the job already has an accepted quote
            const existingJob = await Jobs.findById(quote.issueId);
            if (existingJob.acceptedQuoteId) {
                return res.status(400).json({ message: 'This job already has an accepted quote' });
            }

            // Update the status of the associated issue to "in progress"
            await Jobs.findByIdAndUpdate(quote.issueId, {
                status: 'In progress',
                professionalEmail: profEmail,
                acceptedQuoteId: quoteId
            });
            //logger.info("issue number", issueId, "has been updated to in progress because the client accepted a quote");

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
                message: `🎉 Congrats! Your quote for the job titled "${issue.title}" has been accepted. The job is now in progress.`,
                isRead: false,
            });
            await notification.save();
            logger.info("the accepted quote received a notification");

            // initChat
            const  clientId  = req.user.id;
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
                        message: `🔴 Sorry! Your quote for the job titled "${issue.title}" has been rejected.`,
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
                message: `🔴 Sorry! Your quote for the job titled "${issue.title}" has been rejected.`,
                isRead: false,
            });
            await notification.save();

            logger.info(
                "a rejected quote received a notification for issue number",
                updatedQuote.issueId
            );

            res.status(200).json({ message: `Quote rejected successfully.`, quote: updatedQuote });
        }
    } catch (error) {
        console.error('Error updating quote status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Fetch all quotes for a given clientEmail
 */
const getQuotesByClientEmail = async (req, res) => {
    try {
        const { clientEmail } = req.params;
        const quotes = await Quotes.find({ clientEmail }).lean();

        const populated = await Promise.all(quotes.map(async (quote) => {
            const pro = await fixerClient.findOne({ email: quote.professionalEmail }).lean();
            if (!pro) return quote;

            return {
                ...quote,
                professionalFirstName: pro.firstName,
                professionalLastName: pro.lastName,
                professionalReviewCount: pro.reviewCount ?? 0,
                professionalTotalRating: pro.totalRating ?? 0,
            };
        }));

        return res.status(200).json(populated);
    } catch (error) {
        console.error('Error fetching quotes by clientEmail:', error);
        return res.status(500).json({ error: 'Failed to fetch quotes' });
    }
};


module.exports = { authenticateJWT, submitQuote, getQuotesByJob, updateQuoteStatus, getQuotesByClientEmail };
