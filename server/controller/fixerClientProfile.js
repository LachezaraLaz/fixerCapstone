const jwt = require('jsonwebtoken');  // Make sure this is required to use JWT verification
const fixerClientObject = require('../model/fixerClientModel'); // Mongoose model for professional
const UnauthorizedError = require("../utils/errors/UnauthorizedError");
const ForbiddenError = require("../utils/errors/ForbiddenError");
const NotFoundError = require("../utils/errors/NotFoundError");
const {logger} = require("../utils/logger");

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
        return next(new UnauthorizedError('client profile', 'Missing auth header', 401))  // No token provided
    }

    const token = authorizationHeader.split(' ')[1];  // Extract token from Authorization header

    if (!token) {
        return next(new UnauthorizedError('client profile', 'Missing auth token', 401))  // No token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new ForbiddenError('client profile', 'Token invalid', 403)); // Token invalid
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
            throw new NotFoundError('client profile','Client not found', 404);
        }

        // Respond with professional's data
        res.json(client);
    } catch (error) {
        logger.error('Error fetching client data:', error);
        next(error); // custom error handler
    }
};


const updateProfile = async (req, res) => {
    try {
        // Get token from request header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        // Extract user info from token using JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.email;

        if (!userEmail) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get updated profile data from request body
        const { firstName, lastName, street, postalCode, provinceOrState, country } = req.body;

        // Find and update the user - use the same model your profile endpoint uses
        const user = await fixerClientObject.fixerClient.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields if provided
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (street !== undefined) user.street = street;
        if (postalCode !== undefined) user.postalCode = postalCode;
        if (provinceOrState !== undefined) user.provinceOrState = provinceOrState;
        if (country !== undefined) user.country = country;

        // Save the updated user
        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                street: user.street,
                postalCode: user.postalCode,
                provinceOrState: user.provinceOrState,
                country: user.country
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }

        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { profile, authenticateJWT, updateProfile };