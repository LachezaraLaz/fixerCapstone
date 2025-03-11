const { Jobs } = require('../model/createIssueModel');

/**
 * @module server/repository
 */

/**
 * Retrieves all jobs from the database.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of job objects.
 * @throws {Error} If there is an issue fetching the jobs.
 */
const getAllJobs = async () => {
    try {
        const jobs = await Jobs.find();
        return jobs;
    } catch (error) {
        throw new Error('Failed to fetch jobs');
    }
};

module.exports = { getAllJobs };
