const { squareClient } = require('../utils/squareConfig');
console.log('Square Client:', squareClient);
const ProfessionalPayment = require('../model/professionalPaymentModel');

async function createProfessionalCustomer(professionalId, firstName, lastName, email) {
    try {
        const response = await squareClient.customers.create({
            givenName: firstName,
            familyName: lastName,
            emailAddress: email
        });

        const customerId = response.customer.id;

        // Store in the database
        await ProfessionalPayment.create({ professionalId, squareCustomerId: customerId });

        return { success: true, customerId };
    } catch (error) {
        console.error('Error linking professional to Square:', error);
        return { success: false, error: error.message };
    }
}

console.log('Customers API:', squareClient.customersApi);

module.exports = { createProfessionalCustomer };
