// Issue DTO to format the response
const issueDTO = (job) => ({
    id: job._id,
    title: job.title,
    description: job.description,
    professionalNeeded: job.professionalNeeded,
    status: job.status,
    createdAt: job.createdAt,
});

module.exports = { issueDTO };
