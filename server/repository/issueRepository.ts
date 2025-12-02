import { Job } from "../model/job";

/**
 * @module server/repository
 */

/**
 * Retrieves all jobs from the database.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of job objects.
 * @throws {Error} If there is an issue fetching the jobs.
 */
export const getAllJobs = async () => {
  try {
    // Fetch only jobs with status "open"
    const jobs = await Job.find({ status: "open" });
    return jobs;
  } catch (error: any) {
    throw new Error("Error fetching open jobs: " + error.message);
  }
};
