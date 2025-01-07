const express = require('express');
const { submitQuote, authenticateJWT } = require('../controller/submitQuote');
const quoteRouter = express.Router();

quoteRouter.post('/create', authenticateJWT, submitQuote);

module.exports = {quoteRouter};
