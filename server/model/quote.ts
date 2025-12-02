import mongoose, { Schema, Document, Model } from "mongoose";

import { IJob } from "./job";

export enum QuoteStatus {
  ACCEPTED = "accepted",
  DONE = "done",
  PENDING = "pending",
  REJECTED = "rejected",
}

export type IQuoteStatusType = QuoteStatus[keyof QuoteStatus];

export interface IQuote extends Document {
  professionalEmail: string;
  clientEmail: string;
  issueTitle: string;
  price: number;
  jobDescription?: string;
  toolsMaterials?: string;
  termsConditions?: string;
  status: IQuoteStatusType;
  issueId: mongoose.Types.ObjectId | IJob;
  createdAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    professionalEmail: { type: String, required: true },
    clientEmail: { type: String, required: true },
    issueTitle: { type: String, required: true },
    price: { type: Number, required: true },
    jobDescription: { type: String },
    toolsMaterials: { type: String },
    termsConditions: { type: String },
    status: {
      type: String,
      enum: [QuoteStatus.PENDING, QuoteStatus.ACCEPTED, QuoteStatus.REJECTED],
      default: QuoteStatus.PENDING,
    },
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "Quote",
  }
);

export const Quote: Model<IQuote> = mongoose.model<IQuote>(
  "Quote",
  quoteSchema
);
