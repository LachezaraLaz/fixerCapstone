const ProfessionalPayment = require('../model/professionalPaymentModel');
const { createProfessionalCustomer } = require('../services/squareService');
const { fixerClient } = require('../model/professionalClientModel');

async function linkProfessionalAccount(req, res) {
    try {
        const professionalId = req.user.id; // Extract professional ID from authenticated user
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Missing required email field." });
        }

        console.log('Professional ID:', professionalId);

        // Check if professional has already linked Square
        const existingPayment = await ProfessionalPayment.findOne({ professionalId });
        console.log('Existing Professional Payment Profile:', existingPayment);
        if (existingPayment) {
            return res.status(400).json({ message: "Square account already linked." });
        }

        // Create a Square customer
        const result = await createProfessionalCustomer(professionalId, email);

        if (result.success) {
            await fixerClient.findByIdAndUpdate(professionalId, { paymentSetup: true });

            res.status(201).json({ message: "Account linked successfully", customerId: result.customerId });
        } else {
            res.status(500).json({ message: "Failed to link account", error: result.error });
        }
    } catch (error) {
        console.error('Error linking professional to Square:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { linkProfessionalAccount };
