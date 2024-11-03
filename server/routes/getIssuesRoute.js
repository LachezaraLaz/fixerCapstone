// routes/issueRoute.js
const express = require('express');
const { getAllIssues } = require('../controller/getAllIssues'); // Import the controller
const issueRouter = express.Router();

console.log('getAllIssues:', getAllIssues);

// Route to fetch all issues
issueRouter.get('/', getAllIssues);

module.exports = { issueRouter };
