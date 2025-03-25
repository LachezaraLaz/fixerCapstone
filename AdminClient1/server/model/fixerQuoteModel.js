const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
    professionalEmail: { type: String, required: true },
    clientEmail: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending'
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FixerJobs',
        required: true
    }
}, {
    timestamps: true,
    collection: "quotes"
});

const quoteModel = mongoose.model("FixerQuotes", quoteSchema);

module.exports = quoteModel;