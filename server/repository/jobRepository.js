const { Jobs } = require('../model/createIssueModel');
const AppError = require('../utils/AppError');

// Fetch jobs for a specific user by email
const getJobsByUserEmail = async (userEmail) => {
    try {
        return await Jobs.find({ userEmail });
    } catch (error) {
        throw new AppError(`Failed to fetch jobs for user: ${error.message}`, 500);
    }
};

// Fetch a job by its ID
const getJobByIdRepo = async (jobId) => {
    try {
        return await Jobs.findById(jobId.params.jobId);
    } catch (error) {
        throw new AppError(`Failed to fetch job by ID: ${error.message}`, 500);
    }
};

// Update job status (Reopen job)
const updateJobStatus = async (jobId, status) => {
    try {
        return await Jobs.findByIdAndUpdate(jobId, { status }, { new: true });
    } catch (error) {
        throw new AppError(`Failed to update job status: ${error.message}`, 500);
    }
};

// Update job details
const updateJob = async (jobId, updateData) => {
    try {
        return await Jobs.findByIdAndUpdate(jobId, updateData, { new: true, runValidators: true });
    } catch (error) {
        throw new AppError(`Failed to update job: ${error.message}`, 500);
    }
};

module.exports = { getJobsByUserEmail, getJobByIdRepo, updateJobStatus, updateJob };
