const mongoose = require('mongoose');

const creatIssueModel = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    professionalNeeded: { type: String, required: true },
    imageUrl: { type: String }, // store the URL of the uploaded image
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'open' }, // e.g., open, in-progress, closed
}, {
    collection: 'jobs'
});

const Jobs = mongoose.model('Jobs', creatIssueModel);

module.exports = { Jobs };
