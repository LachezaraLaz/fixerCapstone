const mongoose = require('mongoose');

const professionalClientModel = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    password: String,
    approved: Boolean,
    approvedAt: Date,
    accountType: String,
    formComplete: Boolean,
    idImageUrl: String,
    passwordResetPin: String,
    passwordResetExpires: Date,
    verified: { type: Boolean, default: false },
    verificationToken: String,
    totalRating: { type: Number, default: 0 }, // Cumulative rating for the professional
    reviewCount: { type: Number, default: 0 }, // Number of reviews received
}, {
    collection: 'fixerClientInfo'
});

const fixerClient = mongoose.model('fixerClientInfo', professionalClientModel);

module.exports = { fixerClient };



