const jwt = require('jsonwebtoken');
const { Quotes } = require('../model/quoteModel');
const mongoose = require('mongoose');


// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('Token received:', token);  // Log the token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        console.log('User data from token:', user);  // Log user data
        req.user = user;
        next();
    });
};


// Function to create a new quote
const submitQuote = async (req, res) => {
    console.log('User data in submitQuote:', req.user);  // Log the user data

    const { clientEmail, price, issueId } = req.body;

    if (!clientEmail || !price || !issueId) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const professionalEmail = req.user.email;  // This should come from req.user if it's set correctly

        if (!professionalEmail) {
            return res.status(400).json({ message: 'Professional email not found.' });
        }

        // Check if a quote already exists
        const existingQuote = await Quotes.findOne({ issueId, professionalEmail });
        if (existingQuote) {
            return res.status(400).json({ message: 'You have already submitted a quote for this issue.' });
        }

        const newQuote = await Quotes.create({
            professionalEmail,
            clientEmail,
            price,
            issueId,
        });

        res.status(201).json({ message: 'Quote created successfully', quote: newQuote });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports = { authenticateJWT, submitQuote };
