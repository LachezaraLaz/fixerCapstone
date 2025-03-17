const { Jobs } = require('../model/createIssueModel');
const { fixerClient } = require('../model/professionalClientModel');
const {logger} = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * @module server/controller
 */

exports.getReviewsByProfessionalEmail = async (req, res) => {
    try {
        const { email } = req.params;

        // Find all jobs associated with the professional's email that have reviews
        const reviews = await Jobs.find(
            { professionalEmail: email, rating: { $exists: true } }, // Ensure jobs with ratings
            'description professionalNeeded rating comment' // Only select relevant fields
        );

        if (!reviews || reviews.length === 0) {
            logger.info('No reviews found for this professional.');
            throw new AppError('No reviews found for this professional.', 404);
        }

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        logger.error('Error fetching reviews:', error);
        next(new AppError('Internal server error while fetching reviews.', 500));
    }
};

exports.addReview = async (req, res) => {
    try {
        const { jobId, rating, comment } = req.body;

        if (!jobId || !rating || !comment) {
            logger.error('jobId, rating, and comment are required.');
            throw new AppError('jobId, rating, and comment are required.', 400);
        }

        // Find the job by ID
        const job = await Jobs.findById(jobId);
        if (!job) {
            logger.error('Job not found.');
            throw new AppError('Job not found.', 404);
        }

        // Ensure the job is completed or closed
        if (job.status !== 'Closed' && job.status !== 'Completed') {
            logger.error('Reviews can only be added to completed jobs.');
            throw new AppError('Reviews can only be added to completed jobs.', 400);
        }

        // Update the job with the review
        job.rating = rating;
        job.comment = comment;
        await job.save();

        // Get professional from job
        const proEmail = job.professionalEmail;
        if (!proEmail) {
            logger.error('Professional email not found in the job.');
            throw new AppError('Professional email not found in the job.', 404);
        }

        // Find the professional account
        const professional = await fixerClient.findOne({ email: proEmail });
        if (!professional) {
            logger.error('Professional not found using the email.');
            throw new AppError('Professional not found.', 404);
        }

        // Update fields
        professional.totalRating = Math.round(
            ((professional.totalRating * professional.reviewCount) + rating) / (professional.reviewCount + 1) * 10
        ) / 10;
        professional.reviewCount += 1;
        await professional.save();

        logger.info('Review added successfully!');
        res.status(200).json({ message: 'Review added successfully!', job, professional });

    } catch (error) {
        console.error('Error adding review:', error);
        logger.info('Error adding review:', error);
        next(new AppError('Internal server error while adding review.', 500));
    }
};
