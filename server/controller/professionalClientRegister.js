const bcrypt = require('bcrypt');
const fixerClientObject = require('../model/professionalClientModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { stripe } = require('../utils/stripeConfig');
const ProfessionalPayment = require('../model/professionalPaymentModel');
const ProfessionalDTO = require('../DTO/professionalDTO');
const professionalRepository = require('../repository/professionalRepository');

/**
 * @module server/controller
 */

dotenv.config();

/**
 * Registers a new professional user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing user data.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is registered.
 *
 * @throws {Error} - Throws an error if user creation fails.
 */
const registerUser = async (req, res) => {
    const professionalData = ProfessionalDTO.fromRequestBody(req.body);

    // Check if user already exists in MongoDB
    const existedUser = await professionalRepository.findProfessionalByEmail(professionalData.email);
    if (existedUser) {
        return res.status(400).send({ statusText: 'Account already exists' });
    }

    // Hash password using the repository function
    professionalData.password = await professionalRepository.hashPassword(professionalData.password);

    try {
        // Check if a Stripe Customer record already exists
        const customers = await stripe.customers.list({
            email: professionalData.email,
            limit: 1,
        });

        let stripeCustomerId;
        if (customers.data.length > 0) {
            // Use the existing Stripe Customer record
            stripeCustomerId = customers.data[0].id;
        } else {
            // Create a new Stripe Customer record
            try {
                const customer = await stripe.customers.create({
                    name: `${professionalData.firstName} ${professionalData.lastName}`,
                    email: professionalData.email,
                });
                stripeCustomerId = customer.id;
            } catch (stripeError) {
                console.error('Stripe customer creation failed:', stripeError);
                return res.status(500).send({ status: 'error', data: 'Stripe customer creation failed' });
            }
        }

        // Create the new user using the repository function
        const newUser = await professionalRepository.createProfessional(professionalData);

        // Store the Stripe Customer ID in the ProfessionalPayment collection
        await ProfessionalPayment.create({
            professionalId: newUser._id,
            stripeCustomerId,
        });

        // Generate the verification token using the repository
        const verificationToken = professionalRepository.generateVerificationToken(newUser._id);

        // Save the verification token to the user's record
        newUser.verificationToken = verificationToken;
        await professionalRepository.saveProfessional(newUser);

        // Send verification email using the repository function
        await professionalRepository.sendVerificationEmail(newUser, verificationToken);

        res.send({ status: 'success', data: 'Account created successfully. Please check your email to verify your account.' });
    } catch (e) {
        console.error(e);
        res.status(500).send({ status: 'error', data: 'User creation failed' });
    }
};

module.exports = { registerUser };
