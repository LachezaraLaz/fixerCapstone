const jwt = require('jsonwebtoken');
const { Quotes } = require('../model/quoteModel');  // Adjust the path if needed
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

// Controller to fetch professional jobs
const getMyProfessionalJobs = async (req, res) => {
    const professionalEmail = req.user.email; // Retrieve professional's email from JWT

    try {
        const quotes = await Quotes.find({ professionalEmail }).populate('issueId'); // Populate issue details

        const jobsByStatus = {
            done: [],
            pending: [],
            active: [],
        };

        quotes.forEach((quote) => {
            const jobDetails = {
                title: quote.issueId?.title || 'No title',
                description: quote.issueId?.description || 'No description',
                price: quote.price,
                status: quote.status,
            };

            if (quote.status === 'accepted') {
                jobsByStatus.active.push(jobDetails);
            } else if (quote.status === 'pending') {
                jobsByStatus.pending.push(jobDetails);
            } else if (quote.status === 'done') {
                jobsByStatus.done.push(jobDetails);
            }
        });

        res.status(200).json(jobsByStatus);
    } catch (error) {
        console.error('Error fetching professional jobs:', error);
        res.status(500).json({ error: 'An error occurred while fetching jobs.' });
    }
};

module.exports = { authenticateJWT, getMyProfessionalJobs };
