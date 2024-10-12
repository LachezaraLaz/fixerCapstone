const mongoose = require('mongoose');

const professionalClientModel = new mongoose.Schema({
    username: String,
    email: {type: String, unique: true, required: true},
    password: String,
    approved: Boolean,
},{
    collection: 'fixerClientInfo'
});

const fixerClient = mongoose.model('fixerClientInfo', professionalClientModel);

module.exports = {fixerClient};

