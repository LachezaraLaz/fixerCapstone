const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    professionalNeeded: { type: String, required: true },
    userEmail: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true,
    collection: "jobs"
});

const jobModel = mongoose.model("FixerJobs", jobSchema);

module.exports = jobModel;