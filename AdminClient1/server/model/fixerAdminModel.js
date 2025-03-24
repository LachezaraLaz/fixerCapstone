const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, default: "admin"}, // Admin-specific role
    verified: {type: Boolean, default: false}, // Added field
    verificationCode: {type: String}, // One-time code for verification
    codeExpiresAt: {type: Date},        // Expiration time for the code,
},
    {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: "adminInfo",
});

const adminModel = mongoose.model("AdminInfo", adminSchema);

module.exports = adminModel;