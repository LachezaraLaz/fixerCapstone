const jwt = require('jsonwebtoken');
const { fixerClient } = require('../model/professionalClientModel');
const dotenv = require('dotenv');

/**
 * @module server/controller
 */

dotenv.config();

/**
 * Verifies the email of a professional user based on the provided token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters of the request.
 * @param {string} req.query.token - The verification token.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the email verification process is complete.
 */
async function verifyEmail(req, res) {
    const { token } = req.query;  // Extract token from the query params

    if (!token) {
        return res.status(400).json({ message: 'No verification token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Find the user by ID
        const user = await fixerClient.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Account not found.' });
        }

        // If the user is already verified, return a message
        if (user.verified) {
            return res.status(200).json({ message: 'Email already verified.' });
        }

        // If the token doesn't match or has expired, return an error
        if (user.verificationToken !== token) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Mark the user as verified
        user.verified = true;
        user.verificationToken = undefined;  // Clear the token once it's verified
        await user.save();

        res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
}

module.exports = { verifyEmail };
