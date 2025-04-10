const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  professionalNeeded: { type: String, required: true },
  userEmail: { type: String, required: true },
  professionalEmail: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  timeline: { type: String },
  acceptedQuoteId: { type: mongoose.Schema.Types.ObjectId, ref: "FixerQuotes" },
  latitude: { type: Number },
  longitude: { type: Number },
  imageUrl: { type: String },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled", "open", "closed"],
    default: "pending",
  },
}, {
  timestamps: true,
  collection: "jobs",
});

const jobModel = mongoose.model("FixerJobs", jobSchema);

module.exports = jobModel;
