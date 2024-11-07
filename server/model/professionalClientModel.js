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
}, {
    collection: 'fixerClientInfo'
});

const fixerClient = mongoose.model('fixerClientInfo', professionalClientModel);

module.exports = { fixerClient };



