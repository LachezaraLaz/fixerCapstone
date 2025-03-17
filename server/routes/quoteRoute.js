const express = require('express');
const { submitQuote, authenticateJWT, getQuotesByJob, updateQuoteStatus } = require('../controller/submitQuote');
const checkBankAccount = require('../controller/checkBankAccount');
const quoteRouter = express.Router();

quoteRouter.post('/create', authenticateJWT, checkBankAccount, submitQuote);
quoteRouter.get('/job/:jobId', authenticateJWT, getQuotesByJob);
quoteRouter.put('/:quoteId', authenticateJWT, updateQuoteStatus);

module.exports = { quoteRouter };
