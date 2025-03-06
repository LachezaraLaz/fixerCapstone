const { getAllJobs } = require('../../server/controller/issueRepository');
const { issueDTO } = require('../../server/controller/issueDTO');

// GET /issues route to fetch all jobs
const getAllIssues = async (req, res) => {
    try {
        const jobs = await getAllJobs();
        const formattedJobs = jobs.map(job => issueDTO(job));

        res.status(200).json({ jobs: formattedJobs });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

module.exports = { getAllIssues };
