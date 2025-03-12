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
    const { userId, accountNumber, routingNumber, accountHolderName, accountType } = req.body;

    try {
        // Validate input
        if (!accountNumber || !routingNumber || !accountHolderName || !accountType) {
            return res.status(400).send({ success: false, message: 'All fields are required.' });
        }

        // Store banking information in MongoDB (for reference)
        await fixerClientObject.fixerClient.findByIdAndUpdate(userId, {
            bankingInfo: {
                accountNumber,
                routingNumber,
                accountHolderName,
                accountType,
            },
            bankingInfoAdded: true, // Mark as added (but not yet verified)
        });

        // Redirect the professional to the Square Dashboard to link the bank account
        const squareDashboardUrl = 'https://squareup.com/dashboard/bank-accounts'; // Example URL
        res.send({
            success: true,
            message: 'Banking information saved. Please link your bank account in the Square Dashboard.',
            redirectUrl: squareDashboardUrl,
        });
    } catch (error) {
        console.error('Error adding banking information:', error);
        res.status(500).send({ success: false, message: 'An error occurred while adding banking information.' });
    }
};

const getBankingInfoStatus = async (req, res) => {
    const { userId } = req.query;

    try {
        // Retrieve the professional's Square customer ID from MongoDB
        const professional = await fixerClientObject.fixerClient.findById(userId);
        if (!professional) {
            return res.status(404).json({ message: "Professional not found" });
        }

        // Retrieve the linked bank accounts for the Square customer
        const squareResponse = await squareClient.customers.listCustomerBankAccounts(professional.squareCustomerId);

        if (!squareResponse.result || !squareResponse.result.bankAccounts) {
            return res.status(500).json({ message: "Failed to retrieve bank account information." });
        }

        // Check if any bank account is verified
        const verifiedBankAccount = squareResponse.result.bankAccounts.find(
            (account) => account.status === 'VERIFIED'
        );

        res.json({ bankAccountVerified: !!verifiedBankAccount });
    } catch (error) {
        console.error("Error fetching bank account status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { profile, authenticateJWT, addBankingInfo, getBankingInfoStatus };
