const jwt = require('jsonwebtoken');
const fixerClientObject = require('../model/fixerClientModel'); // Mongoose model for clients
const professionalObject = require('../model/professionalClientModel'); // Mongoose model for professionals

// Middleware to authenticate JWT for any user (client or professional)
const authenticateJWT = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        try {
            // Check if the user is a client
            let user = await fixerClientObject.fixerClient.findById(decodedToken.id);
            if (!user) {
                // If not a client, check if the user is a professional
                user = await professionalObject.fixerClient.findById(decodedToken.id);
            }

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Attach user data and user type to the request for use in other routes
            req.user = user;
            req.userType = user instanceof fixerClientObject.fixerClient ? 'client' : 'professional';
            next();
        } catch (error) {
            console.error('Error in authentication:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

module.exports = { authenticateJWT };
