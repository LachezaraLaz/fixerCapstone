const { fixerClient } = require('../model/fixerClientModel');
const { logger } = require('../utils/logger');
const BadRequestError = require("../utils/errors/BadRequestError");
const NotFoundError = require("../utils/errors/NotFoundError");
const InternalServerError = require("../utils/errors/InternalServerError");

/**
 * @module server/controller
 */

/**
 * Retrieves the user profile based on the provided email.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters of the request.
 * @param {string} req.params.email - The email of the user to retrieve.
 * @param {Object} res - The response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Promise<void>} - A promise that resolves when the user profile is retrieved.
 *
 * @throws {Error} - If there is an error fetching the user profile.
 */
const getUserProfile = async (req, res, next) => {
    try {
        const email = req.params.email;

        // confirm that an email is properly provided
        if (!email) {
            logger.info('No email provided in request query.');
            throw new BadRequestError('user', 'Email is required', 400);
        }


        const user = await fixerClient.findOne({ email });

        if (!user) {
            logger.info('User not found for email:', email);
            throw new NotFoundError('user', 'User not found', 404);
        }

        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            street: user.street,
            postalCode: user.postalCode,
            provinceOrState: user.provinceOrState,
            country: user.country,
        });

        logger.info("user has been found with id: ", user.id, ", email: ", user.email, " and full name: ", user.firstName, " ", user.lastName);
    } catch (error) {
        logger.error('Error fetching user profile:', error);
        next(new InternalServerError('user', `Internal server error: ${error.message}`, 500));
    }
};

module.exports = { getUserProfile};
