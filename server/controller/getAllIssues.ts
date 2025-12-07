
/**
 * @module server/controller
 */

import { Request, Response } from "express";

import { issueDTO } from "../DTO/issueDTO";
import { getAllJobs } from "../repository/issueRepository";

/**
 * Controller function to get all issues.
 * 
 * This function fetches all jobs, formats them using the issueDTO function,
 * and sends the formatted jobs in the response.
 * 
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - If there is an error fetching the jobs, a 500 status code is sent with an error message.
 */
export const getAllIssues = async (req: Request, res:Response) => {
    try {
        const jobs = await getAllJobs();
        const formattedJobs = jobs.map(job => issueDTO(job));

        res.status(200).json({ jobs: formattedJobs });
    } catch (error:any) {
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

module.exports = { getAllIssues };
