const express = require('express');
const { createIssue } = require('../controller/createIssue');
const { getJobsByUser, deleteJob, updateJob, reopenJob} = require('../controller/myIssuesPosted');
//const { getJobById } = require('../repository/jobRepository');
const { getJobById } = require('../controller/myIssuesPosted');
const { upload } = require('../services/cloudinaryService');
const createIssueRouter = express.Router();

// Route to create an issue
createIssueRouter.post('/create', upload('issues').single('image'), createIssue);
// Route to get the client's posted jobs by user email
createIssueRouter.get('/user/:email', getJobsByUser);
// Route to fetch a single job by ID
createIssueRouter.get('/:jobId', getJobById);
// Route to update an issue by ID
createIssueRouter.put('/:jobId', upload('issues').single('image'), updateJob);
// Route to delete a job by ID
createIssueRouter.delete('/delete/:id', deleteJob);
// Route to reopen a job by ID
createIssueRouter.delete('/reopen/:id', reopenJob);

module.exports = { createIssueRouter };
