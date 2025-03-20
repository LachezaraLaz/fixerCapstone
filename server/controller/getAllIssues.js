const { getAllJobs } = require('../repository/issueRepository');
const { issueDTO } = require('../DTO/issueDTO');
const InternalServerError = require("../utils/errors/InternalServerError");

/**
 * @module server/controller
 */

/**
 * Controller function to get all issues.
 * 
 * This function fetches all jobs, formats them using the issueDTO function,
 * and sends the formatted jobs in the response.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - If there is an error fetching the jobs, a 500 status code is sent with an error message.
 */
const getAllIssues = async (req, res) => {
    try {
        const jobs = await getAllJobs();
        const formattedJobs = jobs.map(job => issueDTO(job));

        res.status(200).json({ jobs: formattedJobs });
    } catch (error) {
        next(new InternalServerError('all issues', `Failed to fetch jobs: ${error.message}`, 500));
    }
};

module.exports = { getAllIssues };
