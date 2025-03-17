const { fixerClient } = require('../model/fixerClientModel');
const { logger } = require('../utils/logger');
const AppError = require('../utils/AppError');

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
 * @returns {Promise<void>} - A promise that resolves when the user profile is retrieved.
 *
 * @throws {Error} - If there is an error fetching the user profile.
 */
const getUserProfile = async (req, res) => {
    try {
        const email = req.params.email;

        // confirm that an email is properly provided
        if (!email) {
            console.log('No email provided in request query.');
            throw new AppError('Email is required', 400);
        }

        //find the user linked to that email
        const user = await fixerClient.findOne({ email });

        if (!user) {
            console.log('User not found for email:', email);
            throw new AppError('User not found', 404);
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
        console.error('Error fetching user profile:', error);
        next(new AppError(`Internal server error: ${error.message}`, 500));
    }
};

module.exports = { getUserProfile };
