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
        // Fetch only jobs with status "open"
        const jobs = await Jobs.find({ status: 'open' });
        return jobs;
    } catch (error) {
        throw new Error('Error fetching open jobs: ' + error.message);
    }
};

module.exports = { getAllJobs };
