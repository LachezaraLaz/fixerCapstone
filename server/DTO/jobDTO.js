// Job DTO to format the response
const jobDTO = (job) => ({
    id: job._id,
    title: job.title,
    description: job.description,
    professionalNeeded: job.professionalNeeded,
    status: job.status,
    createdAt: job.createdAt,
    imageUrl: job.imageUrl || 'https://via.placeholder.com/150',
});

module.exports = { jobDTO };
