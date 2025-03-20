const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Quotes } = require('../model/quoteModel');
const Notification = require('../model/notificationModel');
const { fixerClient } = require('../model/fixerClientModel');
const { Jobs } = require('../model/createIssueModel');
const { logger } = require('../utils/logger');
const { initChat } = require('./initChat');
const ForbiddenError = require("../utils/errors/ForbiddenError");
const UnauthorizedError = require("../utils/errors/UnauthorizedError");
const BadRequestError = require("../utils/errors/BadRequestError");
const NotFoundError = require("../utils/errors/NotFoundError");
const InternalServerError = require("../utils/errors/InternalServerError");

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
        return next(new UnauthorizedError('submit quote', 'Missing authorization header', 401));
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('submit quote', 'Token not found', 401));
    }

    // console.log('Token received:', token); // Log the token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new ForbiddenError('submit quote', 'Invalid token', 403));
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
    try {
        logger.info('User data in submitQuote:', req.user); // Log the user data

        const { clientEmail, price, issueId } = req.body;

        if (!clientEmail || !price || !issueId) {
            throw new BadRequestError('submit quote', 'Missing required fields: clientEmail, price, and issueId.', 400);
        }

        const professionalEmail = req.user.email; // This should come from req.user if it's set correctly
        if (!professionalEmail) {
            throw new BadRequestError('submit quote', 'Professional email not found in token.', 400);
        }

        // Check if a quote already exists
        const existingQuote = await Quotes.findOne({ issueId, professionalEmail });
        if (existingQuote) {
            throw new BadRequestError('submit quote', 'You have already submitted a quote for this issue.', 400);
        }

        // Fetch client information
        const clientInfo = await fixerClient.findOne({ email: clientEmail });
        if (!clientInfo) {
            throw new NotFoundError('submit quote', 'Client information not found', 404);
        }

        // Fetch the issue to get the title
        const issue = await Jobs.findById(issueId);
        if (!issue) {
            throw new NotFoundError('submit quote', 'Issue not found.', 404);
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
        logger.error('Error creating quote:', error);
        next(new InternalServerError('submit quote', `Internal server error while creating quote: ${error.message}`, 500));
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
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new BadRequestError('submit quote', 'Invalid job ID.', 400);
        }

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
        logger.error('Error fetching quotes:', error);
        next(new InternalServerError('submit quote', `Error fetching quotes for the job: ${error.message}`, 500));
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
    try {
        const { quoteId } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            throw new BadRequestError('submit quote', 'Invalid status value. Must be "accepted" or "rejected".', 400);
        }

        // Fetch the quote to get the associated job (issueId)
        const quote = await Quotes.findById(quoteId);
        if (!quote) {
            throw new NotFoundError('submit quote', 'Quote not found.', 404);
        }

        if (status === 'accepted') {
            // Accept quote
            const updatedQuote = await Quotes.findByIdAndUpdate(
                quoteId,
                { status },
                { new: true }
            );

            if (!updatedQuote) {
                throw new NotFoundError('submit quote', 'Failed to update the quote.', 404);
            }

            // Update the status of the associated issue to "in progress"
            await Jobs.findByIdAndUpdate(quote.issueId, { status: 'In progress' });
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
                throw new NotFoundError('submit quote', 'Professional or issue not found.', 404);
            }

            // Notify the professional whose quote was accepted
            const notification = new Notification({
                userId: professional._id, // Professional's ID
                message: `Your quote for the job titled "${issue.title}" has been accepted. The job is now in progress.`,
                isRead: false,
            });
            await notification.save();
            logger.info("the accepted quote recieved a notification");

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
                        message: `Your quote for the job titled "${issue.title}" has been rejected.`,
                        isRead: false,
                    });
                    await rejectionNotification.save();
                }
            }

            logger.info("the rejected quotes recieved a notification");
            res.status(200).json({ message: `Quote accepted, others rejected and job updated to "in progress".`, quote: updatedQuote });
        } else if (status === 'rejected') {
            // Handle manual rejection of a quote
            const updatedQuote = await Quotes.findByIdAndUpdate(
                quoteId,
                { status },
                { new: true }
            );

            if (!updatedQuote) {
                throw new NotFoundError('submit quote', 'Failed to update the quote.', 404);
            }

            // Notify the professional whose quote was rejected
            const professional = await fixerClient.findOne({ email: updatedQuote.professionalEmail });
            const issue = await Jobs.findById(updatedQuote.issueId);

            if (!professional || !issue) {
                throw new NotFoundError('submit quote', 'Professional or issue not found.', 404);
            }

            const notification = new Notification({
                userId: professional._id, // Professional's ID
                message: `Your quote for the job titled "${issue.title}" has been rejected.`,
                isRead: false,
            });
            await notification.save();

            logger.info("a rejected quote recieved a notification for issue number", issueId);

            res.status(200).json({ message: `Quote rejected successfully.`, quote: updatedQuote });
        }
    } catch (error) {
        logger.error('Error updating quote status:', error);
        next(new InternalServerError('submit quote', `Internal server error while updating quote status: ${error.message}`, 500));
    }
};


module.exports = { authenticateJWT, submitQuote, getQuotesByJob, updateQuoteStatus };
