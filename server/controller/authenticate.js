const jwt = require('jsonwebtoken');
const { fixerClient } = require('../model/fixerClientModel');
const { professionalClient } = require('../model/professionalClientModel');
const InternalServerError = require("../utils/errors/InternalServerError");
const {logger} = require("../utils/logger");
const UnauthorizedError = require("../utils/errors/UnauthorizedError");
const ForbiddenError = require("../utils/errors/ForbiddenError");
const NotFoundError = require("../utils/errors/NotFoundError");

/**
 * @module server/controller
 */

/**
 * Middleware to authenticate JWT tokens.
 * 
 * This middleware checks for the presence of an authorization header,
 * verifies the JWT token, and attaches the user data to the request object.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers.authorization - The authorization header containing the JWT token.
 * @param {Object} res - The response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - Returns a response with status 401 if the authorization header or token is missing,
 *                     status 403 if the token verification fails,
 *                     status 404 if the user is not found,
 *                     or status 500 if there is a server error.
 * 
 * @throws {Error} - Throws an error if there is an issue with the authentication process.
 */
const authenticateJWT = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        logger.warn("Authorization header missing");
        return next(new UnauthorizedError('authentication', 'Header missing', 401));
    }

    const token = authorizationHeader.split(' ')[1];
    logger.info("Received Token:", token);

    if (!token) {
        logger.warn("Token missing in authorization header");
        return next(new UnauthorizedError('authentication', 'token missing', 401));
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
            logger.warn("Token verification failed:", err.message);
            return next(new ForbiddenError('authentication', 'token verification', 403));
        }

        logger.info("Decoded Token:", decodedToken);

        try {
            // Check if the user is a client
            let user = await fixerClient.findById(decodedToken.id);
            logger.info("Client user found:", user);

            if (!user) {
                // If not a client, check if the user is a professional
                user = await professionalClient.findById(decodedToken.id);
                logger.info("Professional user found:", user);
            }

            if (!user) {
                logger.warn("User not found in either client or professional collections");
                return next(new NotFoundError('authentication', 'User not found', 404));
            }

            // Attach user data and user type to the request for use in other routes
            req.user = user;
            req.userType = user instanceof fixerClient ? 'client' : 'professional';
            next();
        } catch (error) {
            logger.error('Error in authentication:', error);
            next(new InternalServerError('authentication', 'Server error', 500));
        }
    });
};

module.exports = { authenticateJWT };
