const { fixerClient } = require('../model/fixerClientModel');
const { logger } = require('../utils/logger');

const getUserProfile = async (req, res) => {
    const email = req.params.email;

    if (!email) {
        console.log('No email provided in request query.');
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
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

module.exports = { getUserProfile};
