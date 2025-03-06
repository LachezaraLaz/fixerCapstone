const { Jobs } = require('../model/createIssueModel');

// Fetch jobs for a specific user by email
const getJobsByUserEmail = async (userEmail) => {
    try {
        return await Jobs.find({ userEmail });
    } catch (error) {
        throw new Error('Failed to fetch jobs for user');
    }
};

// Fetch a job by its ID
const getJobById = async (jobId) => {
    try {
        return await Jobs.findById(jobId);
    } catch (error) {
        throw new Error('Failed to fetch job by ID');
    }
};

// Update job status (Reopen job)
const updateJobStatus = async (jobId, status) => {
    try {
        return await Jobs.findByIdAndUpdate(jobId, { status }, { new: true });
    } catch (error) {
        throw new Error('Failed to update job status');
    }
};

// Update job details
const updateJob = async (jobId, updateData) => {
    try {
        return await Jobs.findByIdAndUpdate(jobId, updateData, { new: true, runValidators: true });
    } catch (error) {
        throw new Error('Failed to update job');
    }
};

module.exports = { getJobsByUserEmail, getJobById, updateJobStatus, updateJob };
