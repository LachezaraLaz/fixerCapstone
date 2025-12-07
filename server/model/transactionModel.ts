import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  createdAt: Date;
  customerId: mongoose.Types.ObjectId;
  platformFee: number;
  professionalId: mongoose.Types.ObjectId;
  status: string;
}

const transactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true }, // cents
  createdAt: { type: Date, default: Date.now },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  platformFee: { type: Number, default: 0 }, // cents
  professionalId: {
    type: Schema.Types.ObjectId,
    ref: "ProfessionalClient",
    required: true,
  },
  status: { type: String, default: "pending" }, // TODO: Use enum for status
});

export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
