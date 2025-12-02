import mongoose, { Document } from "mongoose";

export enum JobStatus {
  COMPLETED = "completed",
  IN_PROGRESS = "in progress",
  OPEN = "open",
}

interface IJob extends Document {
  acceptedQuoteId?: mongoose.Schema.Types.ObjectId | null;
  comment?: string;
  createdAt?: Date;
  description: string;
  firstName?: string;
  imageUrl?: string;
  lastName?: string;
  latitude?: number;
  longitude?: number;
  professionalEmail?: string;
  professionalNeeded: string;
  rating?: number;
  status?: string;
  timeline?: string;
  title: string;
  userEmail: string;
}

const job = new mongoose.Schema<IJob>(
  {
    acceptedQuoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      default: null,
    },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
    description: { type: String, required: true },
    firstName: { type: String },
    imageUrl: { type: String }, // store the URL of the uploaded image
    lastName: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    professionalEmail: { type: String },
    professionalNeeded: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    status: { type: String, default: JobStatus.OPEN }, //TODO: enum for status
    timeline: { type: String },
    title: { type: String, required: true },
    userEmail: { type: String, required: true },
  },
  {
    collection: "Job",
  }
);

const Job = mongoose.model<IJob>("Job", job);

export { Job, IJob };
