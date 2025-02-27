const ProfessionalPayment = require('../model/professionalPaymentModel');
const { createProfessionalCustomer } = require('../services/squareService');

async function linkProfessionalAccount(req, res) {
    const { professionalId, email } = req.body;

    if (!professionalId || !email) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    const result = await createProfessionalCustomer(professionalId, email);

    if (result.success) {
        res.status(201).json({ message: "Account linked successfully", customerId: result.customerId });
    } else {
        res.status(500).json({ message: "Failed to link account", error: result.error });
    }
}

module.exports = { linkProfessionalAccount };
