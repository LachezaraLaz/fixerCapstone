const express = require('express');
const { createIssue } = require('../controller/createIssue');
const { upload } = require('../services/cloudinaryService');
const createIssueRouter = express.Router();

// Route to create an issue
createIssueRouter.post('/create', upload.single('image'), createIssue);
//createIssueRouter.post('/create', createIssue);

module.exports = { createIssueRouter };
