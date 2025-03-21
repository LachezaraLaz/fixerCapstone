const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfessionalClient', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // Assuming you have a Customer model
    amount: { type: Number, required: true }, // Amount in cents (e.g., $100.00 = 10000)
    status: { type: String, default: 'pending' }, // Payment status (e.g., 'pending', 'paid', 'complete')
    platformFee: { type: Number, default: 0 }, // Platform fee in cents
    createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;