const mongoose = require('mongoose');


const quoteSchema = new mongoose.Schema({
    professionalEmail: {
        type: String,
        required: true,
    },
    clientEmail: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',  // Default status is 'pending'
    },
    issueId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the _id of the issue
        ref: 'Jobs',  // The reference to the 'Jobs' collection
        required: true,
    },
    createdAt: { type: Date, default: Date.now }
}, {
    collection: 'quotes'
});

const Quotes = mongoose.model('Quotes', quoteSchema);

module.exports = { Quotes };
