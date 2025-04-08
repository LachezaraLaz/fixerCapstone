const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // Check for authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Authentication required. Please log in." });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is missing." });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Add user data to request
            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ message: "Server error during authentication." });
    }
};

module.exports = { authMiddleware };