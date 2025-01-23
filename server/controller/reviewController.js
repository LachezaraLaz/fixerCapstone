const { Jobs } = require('../model/createIssueModel'); // Import the Jobs model

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

        // Only allow reviews for completed jobs
        if (job.status.toLowerCase() !== 'closed' && job.status.toLowerCase() !== 'completed') {
            return res.status(400).json({ message: 'Reviews can only be added to completed jobs.' });
        }

        // Add the review
        job.rating = rating;
        job.comment = comment;

        // Save the updated job
        await job.save();

        res.status(200).json({ message: 'Review added successfully!', job });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};