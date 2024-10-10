const mongoose = require('mongoose');

const professionalClientSchema = new mongoose.Schema({
    username: String,
    email: {type: String, unique: true, required: true},
    password: String,
    approved: Boolean,
},{
    collection: 'fixerClientInfo'
});

mongoose.model('fixerClientInfo', professionalClientSchema);