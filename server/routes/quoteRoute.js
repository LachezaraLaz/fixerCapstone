const express = require('express');
const { submitQuote, authenticateJWT, getQuotesByJob, updateQuoteStatus } = require('../controller/submitQuote');
const quoteRouter = express.Router();

quoteRouter.post('/create', authenticateJWT, submitQuote);
quoteRouter.get('/job/:jobId', authenticateJWT, getQuotesByJob);
quoteRouter.put('/:quoteId', authenticateJWT, updateQuoteStatus);

module.exports = { quoteRouter };
