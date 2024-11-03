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

module.exports = { profile, authenticateJWT };