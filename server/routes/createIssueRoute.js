const express = require('express');
const { createIssue } = require('../controller/createIssue');
const { getJobsByUser } = require('../controller/myIssuesPosted');
const { upload } = require('../services/cloudinaryService');
const createIssueRouter = express.Router();


// Route to create an issue
createIssueRouter.post('/create', upload('issues').single('image'), createIssue);
// Route to get the clients posted jobs
createIssueRouter.get('/user/:email', getJobsByUser);


module.exports = { createIssueRouter };