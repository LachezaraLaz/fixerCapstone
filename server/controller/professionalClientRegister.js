const bcrypt = require('bcrypt');
const fixerClientObject = require('../model/professionalClientModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { stripe } = require('../utils/stripeConfig');
const ProfessionalPayment = require('../model/professionalPaymentModel');

dotenv.config();

// Function to send verification email
async function sendVerificationEmail(user, token) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fixit9337@gmail.com',
            pass: process.env.PASS_RESET,
        },
    });

    const verificationUrl = `https://fixercapstone-production.up.railway.app/professional/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Email Verification',
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`,
    };

    await transporter.sendMail(mailOptions);
}

const registerUser = async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    // Check if user already exists in MongoDB
    const existedUser = await fixerClientObject.fixerClient.findOne({ email });
    if (existedUser) {
        return res.status(400).send({ statusText: 'Account already exists' });
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(password, 12);

    try {
        // Check if a Stripe Customer record already exists
        const customers = await stripe.customers.list({
            email: email,
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
                    name: `${firstName} ${lastName}`,
                    email: email,
                });
                stripeCustomerId = customer.id;
                console.log(`Stripe customer created with ID: ${stripeCustomerId}`);
            } catch (stripeError) {
                console.error('Stripe customer creation failed:', stripeError);
                return res.status(500).send({ status: 'error', data: 'Stripe customer creation failed' });
            }
        }

        // Create the new user object in MongoDB
        const newUser = await fixerClientObject.fixerClient.create({
            firstName,
            lastName,
            email,
            password: encryptedPassword,
            approved: false,  // Set to false, email must be verified before approval
            accountType: 'professional',
            verified: false,  // Set to false initially, will be updated after verification
            paymentSetup: !!stripeCustomerId // Set to true only if stripeCustomerId exists
        });

        // Store the Stripe Customer ID in the ProfessionalPayment collection
        await ProfessionalPayment.create({
            professionalId: newUser._id,
            stripeCustomerId,
        });
        console.log(`ProfessionalPayment record created for professionalId: ${newUser._id}`);

        // Generate the verification token
        const verificationToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Save the verification token to the user's record
        newUser.verificationToken = verificationToken;
        await newUser.save();

        // Send the verification email
        await sendVerificationEmail(newUser, verificationToken);

        res.send({ status: 'success', data: 'Account created successfully. Please check your email to verify your account.' });
    } catch (e) {
        console.error(e);
        res.status(500).send({ status: 'error', data: 'User creation failed' });
    }
};

module.exports = { registerUser };