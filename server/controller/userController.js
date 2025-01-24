const { fixerClient } = require('../model/fixerClientModel');

// GET /users/user/:email route to fetch jobs for a specific user
const getUserProfile = async (req, res) => {
    const email = req.params.email;
    console.log(`here is email: ${email}`);

    if (!email) {
        console.log('No email provided in request query.');
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        console.log('Email received:', email);
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
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getUserProfile };
