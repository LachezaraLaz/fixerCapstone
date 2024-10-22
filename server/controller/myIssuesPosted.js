const { Jobs } = require('../model/createIssueModel');

// GET /jobs/user/:email route to fetch jobs for a specific user
const getJobsByUser = async (req, res) => {
    const userEmail = req.params.email;
    try {
        const jobs = await Jobs.find({ userEmail });
        res.status(200).json({ jobs });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
    }
};

module.exports = { getJobsByUser };
