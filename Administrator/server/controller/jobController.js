const jobModel = require("../model/fixerJobModel");

const getJobs = async (req, res) => {
    try {
        // Fetch all jobs from the database
        const jobs = await jobModel.find({});

        // Return the data
        res.status(200).json({ jobs });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getJobs };