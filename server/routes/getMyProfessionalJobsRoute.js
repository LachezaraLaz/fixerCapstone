const express = require('express');
const { authenticateJWT, getMyProfessionalJobs } = require('../controller/getMyProfessionalJobs');  // Adjust path as needed

const getMyProfessionalJobsRouter = express.Router();

// Route to get professional's jobs
getMyProfessionalJobsRouter.get('/get', authenticateJWT, getMyProfessionalJobs);

module.exports = { getMyProfessionalJobsRouter };
