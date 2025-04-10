const express = require('express');
const emailReportRouter = express.Router();
const { sendEmailReport: sendEmailReportRoute } = require('../controller/reportController');  // Assuming the email controller is located here

// POST route to send the email report
emailReportRouter.post('/', sendEmailReportRoute);

module.exports = emailReportRouter;
