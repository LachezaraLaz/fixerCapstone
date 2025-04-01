const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  approved: { type: Boolean, default: false },
  accountType: { type: String, enum: ["client", "professional"] },
  verified: Boolean,
  banned: { type: Boolean, default: false }, // banning professionals

  // Address fields
  street: String,
  postalCode: String,
  provinceOrState: String,
  country: String,

  // Professional-specific fields
  totalRating: Number,
  reviewCount: Number,
  paymentSetup: Boolean,
  stripeAccountId: String,
  bankingInfoAdded: Boolean,
  bankingInfo: mongoose.Schema.Types.Mixed, // or define a proper sub-schema

}, {
  timestamps: true,
  collection: "fixerClientInfo"
});

const clientModel = mongoose.model("FixerClientInfo", clientSchema);

module.exports = clientModel;
