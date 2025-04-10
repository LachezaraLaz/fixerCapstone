const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  professionalEmail: { type: String, required: true },
  clientEmail: { type: String, required: true },
  issueTitle: { type: String },
  price: { type: Number, required: true },
  jobDescription: { type: String },
  toolsMaterials: { type: String },
  termsConditions: { type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "expired"],
    default: "pending"
  },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "FixerJobs" }
}, {
  timestamps: true,
  collection: "quotes"
});

const quoteModel = mongoose.model("FixerQuotes", quoteSchema);
module.exports = quoteModel;
