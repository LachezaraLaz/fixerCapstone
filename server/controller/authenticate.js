const jwt = require('jsonwebtoken');
const { fixerClient } = require('../model/fixerClientModel');
const { professionalClient } = require('../model/professionalClientModel'); 

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
