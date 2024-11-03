const { Jobs } = require('../model/createIssueModel');

// GET /issues route to fetch all jobs
const getAllIssues = async (req, res) => {
    try {
        const jobs = await Jobs.find();
        res.status(200).json({ jobs });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

module.exports = { getAllIssues };
