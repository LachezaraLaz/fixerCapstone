const jwt = require('jsonwebtoken');
const { fixerClient } = require('../model/fixerClientModel');  // Updated model import
const dotenv = require('dotenv');
const BadRequestError = require("../utils/errors/BadRequestError");
const NotFoundError = require("../utils/errors/NotFoundError");
const {logger} = require("../utils/logger");

/**
 * @module server/controller
 */

dotenv.config();

/**
 * Verifies the email of a user based on the provided token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters of the request.
 * @param {string} req.query.token - The verification token.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the email verification process is complete.
 */
async function verifyEmail(req, res) {
    try {
        const { token } = req.query;  // Extract token from the query params

        if (!token) {
            throw new BadRequestError('client email verification', 'No verification token provided.', 400);
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;  // Updated to use 'id' field from the token

        // Find the user by ID
        const user = await fixerClient.findById(userId);
        if (!user) {
            throw new NotFoundError('client email verification', 'Account not found.', 404);
        }

        // If the user is already verified, return a message
        if (user.verified) {
            return res.status(200).json({ message: 'Email already verified.' });
        }

        // If the token doesn't match or has expired, return an error
        if (user.verificationToken !== token) {
            throw new BadRequestError('client email verification', 'Invalid or expired token.', 400);
        }

        // Mark the user as verified
        user.verified = true;
        user.verificationToken = undefined;  // Clear the token once it's verified
        await user.save();

        res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        logger.error(error);
        next(new BadRequestError('client email verification', 'Invalid or expired token.', 400));
    }
}

module.exports = { verifyEmail };