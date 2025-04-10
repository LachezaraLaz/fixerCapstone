// Job DTO to format the response
const jobDTO = (job) => ({
    id: job._id,
    title: job.title,
    description: job.description,
    professionalNeeded: job.professionalNeeded,
    status: job.status,
    createdAt: job.createdAt,
    imageUrl: job.imageUrl || 'https://via.placeholder.com/150',
    latitude: job.latitude || 0.0,
    longitude: job.longitude || 0.0,
    rating: job.rating,
    comment: job.comment,
    professionalEmail: job.professionalEmail,
    timeline: job.timeline,
    acceptedQuoteId: job.acceptedQuoteId
});

module.exports = { jobDTO };
