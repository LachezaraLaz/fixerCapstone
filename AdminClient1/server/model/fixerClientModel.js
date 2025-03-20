const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    approved: { type: Boolean, default: false }
    // Any other fields your schema might have
}, {
    timestamps: true,
    collection: "fixerClientInfo"
});

const clientModel = mongoose.model("FixerClientInfo", clientSchema);

module.exports = clientModel;