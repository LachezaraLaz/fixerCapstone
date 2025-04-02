const { getJobsByUserEmail, updateJobStatus, getJobByIdRepo } = require('../repository/jobRepository');
const { jobDTO } = require('../DTO/jobDTO');
const {Jobs} = require("../model/createIssueModel");
const {logger} = require("../utils/logger");

// GET /issue/user/:email route to fetch jobs for a specific user
const getJobsByUser = async (req, res) => {
    const userEmail = req.params.email;
    console.log(`Fetching jobs for userEmail: ${userEmail}`);

    try {
        const jobs = await getJobsByUserEmail(userEmail);

        if (!jobs) {
            return res.status(404).json({ message: 'No jobs found for the user' });
        }

        // Use DTO to format the jobs before returning the
        const formattedJobs = jobs.map(job => jobDTO(job));

        res.status(200).json({ jobs: formattedJobs });
    } catch (error) {
        console.error(`Error fetching jobs for user ${userEmail}:`, error);
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

// GET /issue/:jobId route to fetch a single job by its ID
const getJobById = async (req, res) => {
    const jobId = req.params?.jobId ?? req;

    if (!jobId) {
        return res.status(400).json({ message: 'Job ID is required' });
    }

    try {
        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        // Use DTO to format the job before returning it
        res.status(200).json(jobDTO(job));
    } catch (error) {
        console.error('Error fetching job:', error);
        logger.error('Error fetching job:', error);
        res.status(500).json({ message: 'Failed to fetch job', error: error.message });
    }
};

// DELETE /issue/:id route to update job status (Reopen job)
const updateIssueStatus = async (req, res) => {
    console.log("Request Params:", req.params);
    console.log("Request Query:", req.query);
    const jobId = req.params.id;
    const status = req.query.status;
    console.log(`Updating job status with ID: ${jobId} to ${status}`);
    logger.info(`Updating job status with ID: ${jobId} to ${status}`);

    try {
        // Fetch the existing job to clone
        const existingJob = await Jobs.findById(jobId);


        if (!existingJob) {
            logger.error('Job not found', error);
            return res.status(404).json({ message: 'Job not found' });
        }

        // If the status is "reopen" or similar, create a new job as a clone
        if (status.toLowerCase() === 'open') {
            const clonedJobData = {
                title: existingJob.title,
                description: existingJob.description,
                professionalNeeded: existingJob.professionalNeeded,
                userEmail: existingJob.userEmail,
                status: 'Open',  // New job should be open
                imageUrl: existingJob.imageUrl,
                latitude: existingJob.latitude,
                longitude: existingJob.longitude,
                firstName: existingJob.firstName,
                lastName: existingJob.lastName,
                timeline: existingJob.timeline,
                createdAt: new Date(),  // Set new creation timestamp
            };

            // Create the new cloned job
            const clonedJob = await Jobs.create(clonedJobData);
            console.log("cloned job ", clonedJob);
            logger.info(`Cloned job created with ID: ${clonedJob._id}`);
            await updateJobStatus(jobId, "Reopened");

            res.status(201).json({ message: 'Job cloned and reopened successfully', job: jobDTO(clonedJob) });
        } else {
            // For other status updates, just update the existing job
            const updatedJob = await updateJobStatus(jobId, status);
            console.log("Result of updateJobStatus:", updatedJob);
            if (!updatedJob) {
                logger.error('updateIssueStatus: Job not found when trying to update status');
                return res.status(404).json({ message: 'Job not found' });
            }

            console.log(`Job status updated to ${status}`);
            res.status(200).json({ message: `Job status updated to ${status}`, job: jobDTO(updatedJob) });
        }
    } catch (error) {
        console.error('Error updating job status:', error);
        logger.error('Error updating job status:', error);
        res.status(500).json({ message: 'Failed to update job status', error: error.message });
    }
};


// PUT /issue/:jobId route to update a single job by its ID
const updateJob = async (req, res) => {
    const { jobId } = req.params;
    const { title, description, professionalNeeded, status, timeline, latitude, longitude } = req.body;
    let imageUrl = req.file ? req.file.path : req.body.imageUrl; // Use the uploaded image or existing URL

    console.log(req.body);
    console.log('Update data:', { title, description, professionalNeeded, status, imageUrl, timeline, latitude, longitude });
    logger.info('Updating jobId:', jobId);
    logger.info('Update data:', { title, description, professionalNeeded, status, imageUrl });

    try {
        const existingJob = await getJobByIdRepo(req);

        if (!existingJob) {
            console.log(`Job not found with jobId: ${jobId}`);
            logger.error(`Job not found with jobId: ${jobId}`);
            return res.status(404).json({ message: 'Job not found' });
        }

        const updatedJobData = {
            title: title || existingJob.title,
            description: description || existingJob.description,
            professionalNeeded: professionalNeeded || existingJob.professionalNeeded,
            timeline: timeline || existingJob.timeline,
            status: status || existingJob.status,
            ...(imageUrl && { imageUrl }), // Update imageUrl only if it's provided
            latitude: latitude || existingJob.latitude,
            longitude: longitude || existingJob.longitude,
        };

        const updatedJob = await Jobs.findByIdAndUpdate(jobId, updatedJobData, { new: true, runValidators: true });

        if (!updatedJob) {
            console.log(`Failed to update job with jobID: ${jobId}`);
            logger.error(`Failed to update job with jobID: ${jobId}`);
            return res.status(500).json({ message: 'Failed to update job' });
        }

        console.log('Job updated successfully:', updatedJob);
        logger.info('Job updated successfully:', updatedJob);
        res.status(200).json(jobDTO(updatedJob));
    } catch (error) {
        console.error('Error updating job:', error);
        logger.error('Error updating job:', error);
        return res.status(500).json({ message: 'Failed to update job', error: error.message });
    }
};

module.exports = { getJobsByUser, getJobById, updateIssueStatus, updateJob };
