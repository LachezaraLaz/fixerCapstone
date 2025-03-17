const jwt = require('jsonwebtoken');  // Make sure this is required to use JWT verification
const fixerClientObject = require('../model/fixerClientModel'); // Mongoose model for professional
const AppError = require('../utils/AppError');

/**
 * @module server/controller
 */

/**
 * Middleware to authenticate JWT token from the request headers.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.headers - Request headers.
 * @param {string} req.headers.authorization - Authorization header containing the JWT token.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * 
 * @returns {Object} - Returns a 401 status with a message 'Unauthorized' if no token is provided or if the token is invalid.
 *                     Returns a 403 status with a message 'Forbidden' if the token verification fails.
 *                     Proceeds to the next middleware or route handler if the token is valid.
 */
const authenticateJWT = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;  // Get authorization header

    if (!authorizationHeader) {
        return next(new AppError('Unauthorized', 401))  // No token provided
    }

    const token = authorizationHeader.split(' ')[1];  // Extract token from Authorization header

    if (!token) {
        return next(new AppError('Unauthorized', 401))  // No token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new AppError('Forbidden', 403)); // Token invalid
        }
        req.user = user;  // Attach user details from the token to the request
        next();  // Proceed to the next middleware or route handler
    });
};

/**
 * Fetches the profile of a client based on the user ID from the JWT token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing the user ID.
 * @param {string} req.user.id - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {Error} - If there is an error fetching the client data.
 */
const profile = async (req, res) => {
    try {
        // Find the professional by their user ID from the JWT token
        const client = await fixerClientObject.fixerClient.findById(req.user.id);

        if (!client) {
            throw new AppError('Client not found', 404);
        }

        // Respond with professional's data
        res.json(client);
    } catch (error) {
        console.error('Error fetching client data:', error);
        next(error); // custom error handler
    }
};

module.exports = { profile, authenticateJWT };