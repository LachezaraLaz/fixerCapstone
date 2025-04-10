const { Jobs } = require('../model/createIssueModel');
const InternalServerError = require("../utils/errors/InternalServerError");

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
        // Fetch only jobs with status "open"
        const jobs = await Jobs.find({ status: 'open' });
        return jobs;
    } catch (error) {
        throw new InternalServerError('issue repo', `Failed to fetch jobs: ${error.message}`, 500);
    }
};

module.exports = { getAllJobs };
