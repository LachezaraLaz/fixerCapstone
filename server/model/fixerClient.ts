import mongoose, { Document } from "mongoose";

interface IFixerClient extends Document {
  accountType?: string;
  approved?: boolean;
  approvedAt?: Date;
  country?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  passwordResetExpires?: Date;
  passwordResetToken?: string;
  postalCode?: string;
  provinceOrState?: string;
  street?: string;
  verificationToken?: string;
  verified?: boolean;
}

const fixerClientModel = new mongoose.Schema<IFixerClient>(
  {
    accountType: String,
    approved: Boolean,
    approvedAt: Date,
    country: String,
    email: { type: String, unique: true, required: true },
    firstName: String,
    lastName: String,
    password: String,
    passwordResetExpires: Date,
    passwordResetToken: String,
    postalCode: String,
    provinceOrState: String,
    street: String,
    verificationToken: String,
    verified: { type: Boolean, default: false },
  },
  {
    collection: "fixerClientInfo",
  }
);

const fixerClient = mongoose.model<IFixerClient>(
  "ClientInfo",
  fixerClientModel
);

export { fixerClient, IFixerClient };
