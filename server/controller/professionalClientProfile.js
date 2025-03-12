const jwt = require('jsonwebtoken');  // Make sure this is required to use JWT verification
const fixerClientObject = require('../model/professionalClientModel');
const {squareClient} = require("../utils/squareConfig"); // Mongoose model for professional

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
        const professional = await fixerClientObject.fixerClient.findById(req.user.id);

        if (!professional) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        // Respond with professional's data
        res.json(professional);
    } catch (error) {
        console.error('Error fetching professional data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addBankingInfo = async (req, res) => {
    const { userId, accountNumber, routingNumber } = req.body;

    try {
        // Validate input
        if (!accountNumber || !routingNumber) {
            return res.status(400).send({ success: false, message: 'Account number and routing number are required.' });
        }

        // Use Square's API to securely store the banking information
        const squareResponse = await squareClient.bankAccounts.createBankAccount({
            accountNumber,
            routingNumber,
            // Add other required fields (e.g., account holder name, account type)
        });

        if (!squareResponse.result || !squareResponse.result.bankAccount) {
            return res.status(500).send({ success: false, message: 'Failed to add banking information with Square.' });
        }

        // Update the professional's record in MongoDB
        await fixerClientObject.fixerClient.findByIdAndUpdate(userId, {
            bankingInfoAdded: true,
            squareBankAccountId: squareResponse.result.bankAccount.id,
        });

        res.send({ success: true, message: 'Banking information added successfully.' });
    } catch (error) {
        console.error('Error adding banking information:', error);
        res.status(500).send({ success: false, message: 'An error occurred while adding banking information.' });
    }
};

const getBankingInfoStatus = async (req, res) => {
    console.log("getBankingInfoStatus called"); // Add this line
    try {
        const userId = req.user.id;
        console.log("User ID:", userId); // Add this line

        const professional = await fixerClientObject.fixerClient.findById(userId);
        if (!professional) {
            return res.status(404).json({ message: "Professional not found" });
        }

        console.log("Banking Info Status:", professional.bankingInfoAdded); // Add this line
        res.json({ bankingInfoAdded: professional.bankingInfoAdded || false });
    } catch (error) {
        console.error("Error fetching banking info status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { profile, authenticateJWT, addBankingInfo, getBankingInfoStatus };
