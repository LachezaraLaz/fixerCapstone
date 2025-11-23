import mongoose, { Document } from "mongoose";

interface IBankingInfo {
  accountHolderName?: string | null;
  accountNumber?: string | null;
  accountType?: string | null; // CHECKING or SAVINGS
  routingNumber?: string | null;
}

interface IProfessionalClient extends Document {
  accountType?: string;
  approved?: boolean; // has admin team approved the professional's credentials
  approvedAt?: Date;
  bankingInfo?: IBankingInfo;
  bankingInfoAdded?: boolean; // Banking info added
  email: string;
  firstName?: string;
  formComplete?: boolean; // has the professional completed the form
  idImageUrl?: string;
  lastName?: string;
  password?: string;
  passwordResetExpires?: Date;
  passwordResetPin?: string;
  paymentSetup?: boolean; // Stripe account linked
  reviewCount?: number;
  stripeAccountId?: string | null; // Stripe Connect account ID
  totalRating?: number;
  verified?: boolean; // has email been verified?
  verificationToken?: string;
}

const professionalClientSchema = new mongoose.Schema<IProfessionalClient>(
  {
    accountType: String,
    approved: Boolean,
    approvedAt: Date,
    bankingInfo: {
      accountHolderName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      accountType: { type: String, default: null }, // CHECKING or SAVINGS
      routingNumber: { type: String, default: null },
    },
    bankingInfoAdded: { type: Boolean, default: false },
    email: { type: String, unique: true, required: true },
    firstName: String,
    formComplete: Boolean,
    idImageUrl: String,
    lastName: String,
    password: String,
    passwordResetExpires: Date,
    passwordResetPin: String,
    paymentSetup: { type: Boolean, default: false },
    reviewCount: { type: Number, default: 0 },
    stripeAccountId: { type: String, default: null },
    totalRating: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    verificationToken: String,
  },
  {
    collection: "fixerClientInfo",
  }
);

const professionalClient = mongoose.model<IProfessionalClient>(
  "fixerClientInfo",
  professionalClientSchema
);

export { professionalClient, IProfessionalClient, IBankingInfo };
