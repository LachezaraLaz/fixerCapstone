const mongoose = require('mongoose'); // Import mongoose
const { Jobs } = require('../model/createIssueModel');
const { uploadImageToCloudinary } = require('../services/cloudinaryService'); // Import the Cloudinary service
const { fixerClient } = require('../model/fixerClientModel');
const { getCoordinatesFromAddress } = require('../services/geoCodingService');


// GET /issue/user/:email route to fetch jobs for a specific user
const getJobsByUser = async (req, res) => {
    const userEmail = req.params.email;
    console.log(`Fetching jobs for userEmail: ${userEmail}`);

    try {
        const jobs = await Jobs.find({ userEmail });
        res.status(200).json({ jobs });
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
        const job = await Jobs.findById(new mongoose.Types.ObjectId(jobId));
        console.log('Job found:', job);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ message: 'Failed to fetch job', error: error.message });
    }
};

// DELETE /issue/:id route to delete a job by its ID
const deleteReopenJob = async (req, res) => {
    const jobId = req.params.id;
    const { status } = req.body;
    console.log(`Updating job status with ID: ${jobId} to ${status}`);

    try {
        const updatedJob = await Jobs.findByIdAndUpdate(
            jobId,
            { status },
            { new: true } // Return the updated job document
        );
        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: `Job status updated to ${status}`, job: updatedJob });
    } catch (error) {
        console.error('Error updating job status:', error);
        res.status(500).json({ message: 'Failed to update job status', error: error.message });
    }
};

// PUT /issue/:jobId route to update a single job by its ID
// Function to update an existing issue
const updateJob = async (req, res) => {
    const { jobId } = req.params;
    const { title, description, professionalNeeded, status, email } = req.body;
    let imageUrl = req.file ? req.file.path : req.body.imageUrl; // Use the uploaded image or existing URL

    console.log('Updating jobId:', jobId);
    console.log('Update data:', { title, description, professionalNeeded, status, imageUrl });

    try {
        const existingJob = await Jobs.findById(jobId);
        if (!existingJob) {
            console.log(`Job not found with jobId: ${jobId}`);
            return res.status(404).json({ message: 'Job not found' });
        }

        // Update the job with new data
        const updatedJob = await Jobs.findByIdAndUpdate(
            jobId,
            {
                title: title || existingJob.title,
                description: description || existingJob.description,
                professionalNeeded: professionalNeeded || existingJob.professionalNeeded,
                status: status || existingJob.status,
                ...(imageUrl && { imageUrl }), // Update imageUrl only if it's provided
            },
            { new: true, runValidators: true } // Return updated document
        );

        if (!updatedJob) {
            console.log(`Failed to update job with jobId: ${jobId}`);
            return res.status(500).json({ message: 'Failed to update job' });
        }

        console.log('Job updated successfully:', updatedJob);
        res.status(200).json(updatedJob);
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Failed to update job', error: error.message });
    }
};

module.exports = { getJobsByUser, getJobById, deleteReopenJob, updateJob };