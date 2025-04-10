// Issue DTO to format the response
const issueDTO = (job) => ({
    id: job._id,
    title: job.title,
    description: job.description,
    professionalNeeded: job.professionalNeeded,
    status: job.status,
    userEmail: job.userEmail,
    createdAt: job.createdAt,
    latitude: job.latitude || 0.0,
    longitude: job.longitude || 0.0,
    timeline: job.timeline,
    rating: job.rating,
    comment: job.comment,
    imageUrl: job.imageUrl,
    firstName: job.firstName,
    lastName: job.lastName,
});

module.exports = { issueDTO };
