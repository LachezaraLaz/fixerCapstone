const { Jobs } = require('../model/createIssueModel');

const getAllJobs = async () => {
    try {
        const jobs = await Jobs.find();
        return jobs;
    } catch (error) {
        throw new Error('Failed to fetch jobs');
    }
};

module.exports = { getAllJobs };
