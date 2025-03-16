const ProfessionalPayment = require('../model/professionalPaymentModel');

async function checkBankAccount(req, res, next) {
    const { professionalId } = req.body;

    try {
        const professionalPayment = await ProfessionalPayment.findOne({ professionalId });
        if (!professionalPayment || !professionalPayment.bankAccountId) {
            return res.status(400).send({ status: 'error', data: 'Bank account not linked' });
        }
        next();
    } catch (error) {
        console.error('Error checking bank account:', error);
        res.status(500).send({ status: 'error', data: 'Failed to check bank account' });
    }
}

module.exports = checkBankAccount;