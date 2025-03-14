const { stripe } = require('../utils/stripeConfig');
const ProfessionalPayment = require('../model/professionalPaymentModel');

async function createProfessionalCustomer(professionalId, firstName, lastName, email) {
    try {
        // Create a Stripe customer
        const customer = await stripe.customers.create({
            name: `${firstName} ${lastName}`,
            email: email,
        });

        const customerId = customer.id;

        // Store in the database
        await ProfessionalPayment.create({ professionalId, stripeCustomerId: customerId });

        return { success: true, customerId };
    } catch (error) {
        console.error('Error linking professional to Stripe:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { createProfessionalCustomer };