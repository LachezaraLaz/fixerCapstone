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

// DELETE /jobs/:id route to delete a job by its ID
const deleteJob = async (req, res) => {
    const jobId = req.params.id;
    try {
        const deletedJob = await Jobs.findByIdAndDelete(jobId);
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete job', error: error.message });
    }
};

module.exports = { getJobsByUser, deleteJob };
