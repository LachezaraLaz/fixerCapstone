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

    console.log('Token received:', token); // Log the token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        console.log('User data from token:', user); // Log user data
        req.user = user;
        next();
    });
};

// Function to create a new quote
const submitQuote = async (req, res) => {
    console.log('User data in submitQuote:', req.user); // Log the user data

    const { clientEmail, price, issueId } = req.body;

    if (!clientEmail || !price || !issueId) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const professionalEmail = req.user.email; // This should come from req.user if it's set correctly

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

// Function to fetch quotes for a specific job
const getQuotesByJob = async (req, res) => {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: 'Invalid job ID.' });
    }

    try {
        // Find quotes associated with the job (issueId)
        const quotes = await Quotes.find({ issueId: jobId });

        // Return an empty array if no quotes are found
        res.status(200).json({ offers: quotes || [] });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ message: 'Error fetching quotes for the job.' });
    }
};

// Function to update quotes status
const updateQuoteStatus = async (req, res) => {
    const { quoteId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }

    try {
        const updatedQuote = await Quotes.findByIdAndUpdate(
            quoteId,
            { status },
            { new: true }
        );

        if (!updatedQuote) {
            return res.status(404).json({ message: 'Quote not found.' });
        }

        res.status(200).json({ message: 'Quote updated successfully.', quote: updatedQuote });
    } catch (error) {
        console.error('Error updating quote status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { authenticateJWT, submitQuote, getQuotesByJob, updateQuoteStatus };
