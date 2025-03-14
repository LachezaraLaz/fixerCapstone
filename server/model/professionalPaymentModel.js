const mongoose = require('mongoose');

const professionalPaymentSchema = new mongoose.Schema({
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfessionalClient', required: true },
    stripeCustomerId: { type: String, required: true },
    linkedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfessionalPayment', professionalPaymentSchema);