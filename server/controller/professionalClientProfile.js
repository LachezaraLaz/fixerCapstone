const jwt = require('jsonwebtoken');
const fixerClientObject = require('../model/professionalClientModel');
const { squareClient } = require("../utils/stripeConfig");
const professionalPaymentSchema = require("../model/professionalPaymentModel");
const mongoose = require('mongoose'); // Import mongoose

/**
 * @module server/controller
 */

/**
 * Middleware to authenticate JWT token from the Authorization header.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * 
 * @returns {Object} - Returns a 401 status with a message 'Unauthorized' if no token is provided or if the token is invalid.
 *                     Returns a 403 status with a message 'Forbidden' if the token verification fails.
 *                     Proceeds to the next middleware or route handler if the token is valid.
 */
const authenticateJWT = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden - Invalid token' });
        }

        console.log("Decoded JWT Payload:", user); // Log the decoded token
        req.user = user;
        next();
    });
};

/**
 * Fetches the professional's profile data based on the user ID from the JWT token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing the user ID.
 * @param {string} req.user.id - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const profile = async (req, res) => {
    try {
        console.log("JWT Payload (req.user):", req.user); // Log the JWT payload

        // Find the professional by their user ID from the JWT token
        const professional = await fixerClientObject.fixerClient.findById(new mongoose.Types.ObjectId(req.user.id));

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

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function addCreditCard(req, res) {
    const { professionalId, paymentMethodId } = req.body;

    try {
        const professionalPayment = await professionalPaymentSchema.findOne({ professionalId });
        if (!professionalPayment) {
            return res.status(404).send({ status: 'error', data: 'Professional not found' });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).send({ status: 'error', data: 'Missing Stripe API key' });
        }

        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: professionalPayment.stripeCustomerId,
        });

        await stripe.customers.update(professionalPayment.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethod.id,
            },
        });

        professionalPayment.paymentMethodId = paymentMethod.id;
        await professionalPayment.save();

        await fixerClientObject.fixerClient.findByIdAndUpdate(professionalId, {
            bankingInfoAdded: true,
        });

        res.send({ status: 'success', data: 'Credit card linked successfully' });
    } catch (error) {
        console.error('Error linking credit card:', error);
        res.status(500).send({ status: 'error', data: 'Failed to link credit card' });
    }
}

const getBankingInfoStatus = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const professional = await fixerClientObject.fixerClient.findById(userId);

        if (!professional) {
            return res.status(404).json({ message: "Professional not found" });
        }

        res.json({
            bankingInfoAdded: professional.bankingInfoAdded || false,
            bankingInfo: professional.bankingInfo || null
        });
    } catch (error) {
        console.error("Error fetching banking info status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { profile, authenticateJWT, addBankingInfo: addCreditCard, getBankingInfoStatus };