const jwt = require('jsonwebtoken');
const { fixerClient } = require('../model/fixerClientModel');
const { professionalClient } = require('../model/professionalClientModel');

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
 * @param {Function} next - The next middleware function.
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
        console.log("Authorization header missing");
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authorizationHeader.split(' ')[1];
    console.log("Received Token:", token);

    if (!token) {
        console.log("Token missing in authorization header");
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
            console.log("Token verification failed:", err.message);
            return res.status(403).json({ message: 'Forbidden' });
        }

        console.log("Decoded Token:", decodedToken);

        try {
            // Check if the user is a client
            let user = await fixerClient.findById(decodedToken.id);
            console.log("Client user found:", user);

            if (!user) {
                // If not a client, check if the user is a professional
                user = await professionalClient.findById(decodedToken.id);
                console.log("Professional user found:", user);
            }

            if (!user) {
                console.log("User not found in either client or professional collections");
                return res.status(404).json({ message: 'User not found' });
            }

            // Attach user data and user type to the request for use in other routes
            req.user = user;
            req.userType = user instanceof fixerClient ? 'client' : 'professional';
            next();
        } catch (error) {
            console.error('Error in authentication:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

module.exports = { authenticateJWT };
