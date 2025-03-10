const bcrypt = require('bcrypt');
const fixerClientObject = require('../model/professionalClientModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { squareClient } = require('../utils/squareConfig');
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

// Register user
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
        // Check if a Square Customer record already exists
        const response = await squareClient.customers.search({
            query: {
                filter: {
                    emailAddress: {
                        exact: email
                    }
                }
            }
        });

        console.log("Square API Response:", response);
        let squareCustomerId;
        if (response.customers && response.customers.length > 0) {
            // Use the existing Square Customer record
            squareCustomerId = response.customers[0].id;
        } else {
            // Create a new Square Customer record
            const squareResponse = await squareClient.customers.create({
                givenName: firstName,
                familyName: lastName,
                emailAddress: email
            });
            squareCustomerId = squareResponse.customer.id;
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
            paymentSetup: true // Set to true after Square linking
        });

        // Store the Square Customer ID in the ProfessionalPayment collection
        await ProfessionalPayment.create({
            professionalId: newUser._id,
            squareCustomerId
        });

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