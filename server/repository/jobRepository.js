const { Jobs } = require('../model/createIssueModel');

/**
 * @module server/repository
 */

/**
 * Retrieves jobs associated with a specific user email.
 *
 * @param {string} userEmail - The email of the user whose jobs are to be fetched.
 * @returns {Promise<Array>} A promise that resolves to an array of job objects.
 * @throws {Error} If there is an issue fetching the jobs.
 */
const getJobsByUserEmail = async (userEmail) => {
    try {
        return await Jobs.find({ userEmail });
    } catch (error) {
        throw new Error('Failed to fetch jobs for user');
    }
};

/**
 * Retrieves a job by its ID.
 *
 * @param {string} jobId - The ID of the job to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the job object if found.
 * @throws {Error} If the job retrieval fails.
 */
const getJobById = async (jobId) => {
    try {
        return await Jobs.findById(jobId);
    } catch (error) {
        throw new Error('Failed to fetch job by ID');
    }
};

/**
 * Updates the status of a job by its ID.
 *
 * @param {string} jobId - The ID of the job to update.
 * @param {string} status - The new status to set for the job.
 * @returns {Promise<Object>} The updated job document.
 * @throws {Error} If the job status update fails.
 */
const updateJobStatus = async (jobId, status) => {
    try {
        return await Jobs.findByIdAndUpdate(jobId, { status }, { new: true });
    } catch (error) {
        throw new Error('Failed to update job status');
    }
};

/**
 * Updates a job with the given update data.
 *
 * @param {string} jobId - The ID of the job to update.
 * @param {Object} updateData - The data to update the job with.
 * @returns {Promise<Object>} The updated job document.
 * @throws {Error} If the job update fails.
 */
const updateJob = async (jobId, updateData) => {
    try {
        return await Jobs.findByIdAndUpdate(jobId, updateData, { new: true, runValidators: true });
    } catch (error) {
        throw new Error('Failed to update job');
    }
};

module.exports = { getJobsByUserEmail, getJobById, updateJobStatus, updateJob };
