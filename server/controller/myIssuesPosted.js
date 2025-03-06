const { getJobsByUserEmail, updateJobStatus } = require('../../server/controller/jobRepository');
const { jobDTO } = require('../../server/controller/jobDTO');

// GET /issue/user/:email route to fetch jobs for a specific user
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

// GET /issue/:jobId route to fetch a single job by its ID
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

// DELETE /issue/:id route to update job status (Reopen job)
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

// PUT /issue/:jobId route to update a single job by its ID
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
