const mongoose = require('mongoose');

const contractOfferSchema = new mongoose.Schema({
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jobs', required: true },
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'fixerClient', required: true },
    fee: { type: Number, required: true },
    status: { type: String, default: 'pending' }, // pending, accepted, rejected
    createdAt: { type: Date, default: Date.now }
}, {
    collection: 'contractOffers'
});

const ContractOffer = mongoose.model('ContractOffer', contractOfferSchema);

module.exports = { ContractOffer };
