const mongoose = require('mongoose');

const createIssueModel = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    professionalNeeded: { type: String, required: true },
    imageUrl: { type: String }, // store the URL of the uploaded image
    userEmail: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'open' }, // e.g., open, in-progress, closed
    latitude: { type: Number },
    longitude: { type: Number },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    professionalEmail: { type: String },
}, {
    collection: 'jobs'
});

const Jobs = mongoose.model('Jobs', createIssueModel);

module.exports = { Jobs };
