const express = require('express');
const { submitQuote, authenticateJWT, getQuotesByJob, updateQuoteStatus, getQuotesByClientEmail } = require('../controller/submitQuote');
const quoteRouter = express.Router();

quoteRouter.post('/create', authenticateJWT, submitQuote);
quoteRouter.get('/job/:jobId', authenticateJWT, getQuotesByJob);
quoteRouter.put('/:quoteId', authenticateJWT, updateQuoteStatus);
quoteRouter.get('/client/:clientEmail', authenticateJWT, getQuotesByClientEmail);

module.exports = { quoteRouter };
