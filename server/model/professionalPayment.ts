import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfessionalPayment extends Document {
  professionalId: mongoose.Types.ObjectId;
  paymentMethodId: string;
  stripeCustomerId: string;
  linkedAt: Date;
}

const professionalPaymentSchema = new Schema<IProfessionalPayment>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "ProfessionalClient",
      required: true,
    },
    stripeCustomerId: { type: String, required: true },
    paymentMethodId: { type: String, required: true },
    linkedAt: { type: Date, default: Date.now },
  },
  {
    collection: "ProfessionalPayment",
  }
);

export const ProfessionalPayment: Model<IProfessionalPayment> =
  mongoose.model<IProfessionalPayment>(
    "ProfessionalPayment",
    professionalPaymentSchema
  );
