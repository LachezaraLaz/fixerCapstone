const { fixerClient } = require('../model/fixerClientModel');
const { logger } = require('../utils/logger');

/**
 * @module server/controller/userController
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
    const email = req.params.email;

    // confirm that an email is properly provided
    if (!email) {
        console.log('No email provided in request query.');
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        //find the user linked to that email
        const user = await fixerClient.findOne({ email });

        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found.' });
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
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getUserProfile };
