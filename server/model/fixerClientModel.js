const mongoose = require('mongoose');

const fixerClientModel = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true},
    password: String,
    approved: Boolean,
    approvedAt: Date,
    accountType: String
},{
    collection: 'fixerClientInfo'
});

const fixerClient = mongoose.model('ClientInfo', fixerClientModel);

module.exports = {fixerClient};