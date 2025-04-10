const jwt = require('jsonwebtoken');
const { Quotes } = require('../model/quoteModel');  // Adjust the path if needed
const {logger} = require("../utils/logger");
const ForbiddenError = require("../utils/errors/ForbiddenError");
const UnauthorizedError = require("../utils/errors/UnauthorizedError");
const InternalServerError = require("../utils/errors/InternalServerError");

/**
 * @module server/controller
 */

/**
 * Middleware to authenticate JWT token from the request headers.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * 
 * @returns {Object} - Returns a 401 status with 'Unauthorized' message if no token is provided.
 *                     Returns a 403 status with 'Forbidden' message if token verification fails.
 *                     Proceeds to the next middleware if token is valid.
 */
const authenticateJWT = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return next(new UnauthorizedError('professional jobs','No authorization header provided', 401));
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('professional jobs','No token found in header', 401));
    }

    logger.info('Token received:', token);  // Log the token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new ForbiddenError('professional jobs', 'Invalid or expired token', 403));
        }

        logger.info('User data from token:', user);  // Log user data
        req.user = user;
        next();
    });
};


/**
 * Retrieves the professional's jobs based on their email from the JWT.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object from the JWT.
 * @param {string} req.user.email - The email of the professional.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @description This function fetches all quotes associated with the professional's email,
 * categorizes them by status (all, done, pending, active), calculates the total amount earned,
 * and sends the categorized jobs and amount earned as a JSON response.
 *
 * @throws {Error} - If an error occurs while fetching the jobs, a 500 status code and an error message are sent.
 */
const getMyProfessionalJobs = async (req, res, next) => {
    const professionalEmail = req.user.email; // Retrieve professional's email from JWT

    try {
        // Find quotes and only populate non-deleted jobs
        const quotes = await Quotes.find({ professionalEmail })
            .populate({
                path: 'issueId',
                match: { _id: { $exists: true } } // Only populate if job exists
            });

        let amountEarned = 0;


        const jobsByStatus = {
            all: [],
            done: [],
            pending: [],
            active: [],
            amountEarned: 0,
        };

        // Filter out quotes with null issueId (deleted jobs)
        const validQuotes = quotes.filter(quote => quote.issueId !== null);

        validQuotes.forEach((quote) => {
            // Additional null check as safety net
            if (!quote.issueId) return;

            const jobDetails = {
                id: quote.issueId._id,
                title: quote.issueId.title || 'No title',
                description: quote.issueId.description || 'No description',
                professionalNeeded: quote.issueId.professionalNeeded || "No Professional",
                price: quote.price,
                status: quote.status,
                rating: quote.issueId.rating || 'N/A',
                imageUrl: quote.issueId.imageUrl || 'https://via.placeholder.com/100',
            };

            if (quote.status.toLowerCase() === 'accepted' && quote.issueId.status.toLowerCase() === 'in progress') {
                jobsByStatus.active.push(jobDetails);
                jobsByStatus.all.push(jobDetails);
            } else if (quote.status.toLowerCase() === 'pending' && quote.issueId.status.toLowerCase() === 'open') {
                jobsByStatus.pending.push(jobDetails);
                jobsByStatus.all.push(jobDetails);
            } else if (quote.status.toLowerCase() === 'done' || (quote.status.toLowerCase() === 'accepted' && quote.issueId.status.toLowerCase() === 'completed')) {
                jobsByStatus.done.push(jobDetails);
                jobsByStatus.all.push(jobDetails);
                amountEarned += quote.price;
            }
        });

        jobsByStatus.amountEarned = amountEarned;
        res.status(200).json(jobsByStatus);
    } catch (error) {
        logger.error('Error fetching professional jobs:', error);
        next(new InternalServerError('professional jobs','An error occurred while fetching jobs.', 500));
    }
};

module.exports = { authenticateJWT, getMyProfessionalJobs };