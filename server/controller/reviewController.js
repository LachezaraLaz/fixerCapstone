const { Jobs } = require('../model/createIssueModel');
const { fixerClient } = require('../model/professionalClientModel');

exports.addReview = async (req, res) => {
    const { jobId, rating, comment } = req.body;

    if (!jobId || !rating || !comment) {
        return res.status(400).json({ message: 'jobId, rating, and comment are required.' });
    }

    try {
        // Find the job by ID
        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Ensure the job is completed or closed
        if (job.status !== 'Closed' && job.status !== 'Completed') {
            return res.status(400).json({ message: 'Reviews can only be added to completed jobs.' });
        }

        // Update the job with the review
        job.rating = rating;
        job.comment = comment;
        await job.save();

        // Get professional from job
        const proEmail = job.professionalEmail;
        if (!proEmail) {
            return res.status(404).json({ message: 'Professional email not found in the job.' });
        }

        // Find the professional account
        const professional = await fixerClient.findOne({ email: proEmail });
        if (!professional) {
            return res.status(404).json({ message: 'Professional not found.' });
        }

        // Update fields
        professional.totalRating = ((professional.totalRating * professional.reviewCount) + rating) / (professional.reviewCount + 1);
        professional.reviewCount += 1;
        await professional.save();

        res.status(200).json({ message: 'Review added successfully!', job, professional });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
