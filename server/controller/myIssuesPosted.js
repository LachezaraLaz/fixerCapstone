const { getJobsByUserEmail, updateJobStatus } = require('../repository/jobRepository');
const { jobDTO } = require('../DTO/jobDTO');

/**
 * @module server/controller
 */

/**
 * Fetches jobs posted by a specific user based on their email.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters of the request.
 * @param {string} req.params.email - The email of the user whose jobs are to be fetched.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the jobs are fetched and the response is sent.
 */
const getJobsByUser = async (req, res) => {
    const userEmail = req.params.email;
    console.log(`Fetching jobs for userEmail: ${userEmail}`);

    try {
        const jobs = await getJobsByUserEmail(userEmail);

        if (!jobs) {
            return res.status(404).json({ message: 'No jobs found for the user' });
        }

        // Use DTO to format the jobs before returning them
        const formattedJobs = jobs.map(job => jobDTO(job));

        res.status(200).json({ jobs: formattedJobs });
    } catch (error) {
        console.error(`Error fetching jobs for user ${userEmail}:`, error);
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

/**
 * Retrieves a job by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.jobId - The ID of the job to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the job is retrieved and the response is sent.
 */
const getJobById = async (req, res) => {
    const { jobId } = req.params;
    console.log('Received jobId:', jobId);

    try {
        const job = await getJobById(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Use DTO to format the job before returning it
        res.status(200).json(jobDTO(job));
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ message: 'Failed to fetch job', error: error.message });
    }
};

/**
 * Updates the status of a job based on the provided job ID and status.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the job to update.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.status - The new status to set for the job.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the job status is updated.
 */
const deleteReopenJob = async (req, res) => {
    const jobId = req.params.id;
    const { status } = req.body;
    console.log(`Updating job status with ID: ${jobId} to ${status}`);

    try {
        const updatedJob = await updateJobStatus(jobId, status);

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json({ message: `Job status updated to ${status}`, job: jobDTO(updatedJob) });
    } catch (error) {
        console.error('Error updating job status:', error);
        res.status(500).json({ message: 'Failed to update job status', error: error.message });
    }
};

/**
 * Updates a job with the given jobId using the provided data.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.jobId - The ID of the job to update.
 * @param {Object} req.body - The request body containing the job data.
 * @param {string} [req.body.title] - The new title of the job.
 * @param {string} [req.body.description] - The new description of the job.
 * @param {string} [req.body.professionalNeeded] - The new professional needed for the job.
 * @param {string} [req.body.status] - The new status of the job.
 * @param {string} [req.body.imageUrl] - The existing image URL of the job.
 * @param {Object} [req.file] - The uploaded file object.
 * @param {string} [req.file.path] - The path of the uploaded image file.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the job is updated.
 */
const updateJob = async (req, res) => {
    const { jobId } = req.params;
    const { title, description, professionalNeeded, status, email } = req.body;
    let imageUrl = req.file ? req.file.path : req.body.imageUrl; // Use the uploaded image or existing URL

    console.log('Updating jobId:', jobId);
    console.log('Update data:', { title, description, professionalNeeded, status, imageUrl });

    try {
        const existingJob = await getJobById(jobId);

        if (!existingJob) {
            console.log(`Job not found with jobId: ${jobId}`);
            return res.status(404).json({ message: 'Job not found' });
        }

        const updatedJobData = {
            title: title || existingJob.title,
            description: description || existingJob.description,
            professionalNeeded: professionalNeeded || existingJob.professionalNeeded,
            status: status || existingJob.status,
            ...(imageUrl && { imageUrl }), // Update imageUrl only if it's provided
        };

        const updatedJob = await updateJob(jobId, updatedJobData);

        if (!updatedJob) {
            console.log(`Failed to update job with jobId: ${jobId}`);
            return res.status(500).json({ message: 'Failed to update job' });
        }

        console.log('Job updated successfully:', updatedJob);
        res.status(200).json(jobDTO(updatedJob));
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Failed to update job', error: error.message });
    }
};

module.exports = { getJobsByUser, getJobById, deleteReopenJob, updateJob };
