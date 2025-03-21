// routes/paymentRoute.js
const express = require('express');
const { deductCut } = require('../controller/paymentController');
const paymentRouter = express.Router();

paymentRouter.post('/deduct-cut', deductCut);

module.exports = { paymentRouter };