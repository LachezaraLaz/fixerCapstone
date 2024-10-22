const express = require('express');
const { createIssue } = require('../controller/createIssue');
const { getJobsByUser } = require('../controller/myIssuesPosted');
const { upload } = require('../services/cloudinaryService');
const createIssueRouter = express.Router();
// const myIssuesPostedRouter = express.Router();

// Route to create an issue
createIssueRouter.post('/create', upload.single('image'), createIssue);
createIssueRouter.get('/user/:email', getJobsByUser);


module.exports = { createIssueRouter };

