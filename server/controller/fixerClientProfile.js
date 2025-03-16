const jwt = require('jsonwebtoken');  // Make sure this is required to use JWT verification
const fixerClientObject = require('../model/fixerClientModel'); // Mongoose model for professional

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;  // Get authorization header

    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Unauthorized' });  // No token provided
    }

    const token = authorizationHeader.split(' ')[1];  // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });  // No token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });  // Token invalid
        }
        req.user = user;  // Attach user details from the token to the request
        next();  // Proceed to the next middleware or route handler
    });
};

// Profile fetching function
const profile = async (req, res) => {
    try {
        // Find the professional by their user ID from the JWT token
        const client = await fixerClientObject.fixerClient.findById(req.user.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Respond with professional's data
        res.json(client);
    } catch (error) {
        console.error('Error fetching client data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateProfile = async (req, res) => {
    try {
        // Get token from request header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.log('No token provided in updateProfile request');
            return res.status(401).json({ error: 'Authorization token required' });
        }

        // Extract user info from token using JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userEmail = decoded.email;

        if (!userEmail) {
            console.log('Token did not contain email');
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Get updated profile data from request body
        const { firstName, lastName, street, postalCode, provinceOrState, country } = req.body;

        console.log(`Updating profile for user: ${userEmail}`);
        console.log(`Profile data:`, req.body);

        // Find and update the user - use the same model your profile endpoint uses
        const user = await fixerClient.findOne({ email: userEmail });

        if (!user) {
            console.log(`User not found with email: ${userEmail}`);
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

        console.log(`Profile updated successfully for: ${userEmail}`);

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
            console.log(`JWT Error: ${error.message}`);
            return res.status(401).json({ error: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            console.log('Token expired');
            return res.status(401).json({ error: 'Token expired' });
        }

        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { profile, authenticateJWT, updateProfile };