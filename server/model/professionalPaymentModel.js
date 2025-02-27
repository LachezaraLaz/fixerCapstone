const mongoose = require('mongoose');

const ProfessionalPaymentSchema = new mongoose.Schema({
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfessionalClient', required: true },
    squareCustomerId: { type: String, required: true }, // Square's unique customer ID
    linkedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfessionalPayment', ProfessionalPaymentSchema);
