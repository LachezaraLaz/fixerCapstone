const { stripe } = require('../utils/stripeConfig');
const ProfessionalPayment = require('../model/professionalPaymentModel');
const Quote = require('../model/quoteModel');

async function deductCut(req, res) {
    const { quoteId } = req.body;

    try {
        const quote = await Quote.findById(quoteId);
        if (!quote) {
            return res.status(404).send({ status: 'error', data: 'Quote not found' });
        }

        const professionalPayment = await ProfessionalPayment.findOne({ professionalId: quote.professionalId });
        if (!professionalPayment || !professionalPayment.bankAccountId) {
            return res.status(400).send({ status: 'error', data: 'Professional bank account not linked' });
        }

        const agreedAmount = quote.agreedAmount;
        const platformCut = agreedAmount * 0.10; // Example: 10% platform fee
        const amountAfterCut = agreedAmount - platformCut;

        // Transfer the platform cut to your Stripe account
        const transfer = await stripe.transfers.create({
            amount: platformCut * 100, // Amount in cents
            currency: 'usd',
            destination: professionalPayment.bankAccountId,
            description: `Platform fee for quote ${quoteId}`,
        });

        res.send({ status: 'success', data: 'Platform fee deducted successfully' });
    } catch (error) {
        console.error('Error deducting platform fee:', error);
        res.status(500).send({ status: 'error', data: 'Failed to deduct platform fee' });
    }
}

module.exports = { deductCut };