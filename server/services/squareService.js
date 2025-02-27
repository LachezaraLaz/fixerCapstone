const { squareClient } = require('../utils/squareConfig');
const ProfessionalPayment = require('../model/professionalPaymentModel');

async function createProfessionalCustomer(professionalId, email) {
    try {
        const response = await squareClient.customers.create({
            email_address: email
        });

        const customerId = response.customer.id;

        // Store in database
        await ProfessionalPayment.create({ professionalId, squareCustomerId: customerId });

        return { success: true, customerId };
    } catch (error) {
        console.error('Error linking professional to Square:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { createProfessionalCustomer };
