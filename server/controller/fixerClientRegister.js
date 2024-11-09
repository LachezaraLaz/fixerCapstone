const bcrypt = require('bcrypt');
const fixerClientObject = require('../model/fixerClientModel');
const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const {IPAddress} = require("../ipAddress");

dotenv.config();

const app = express();
app.use(express.json());

// Function to send verification email
async function sendVerificationEmail(user, token) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fixit9337@gmail.com',  // Use your email for sending verification
            pass: process.env.PASS_RESET,  // Ensure this environment variable is set
        },
    });

    const verificationUrl = `https://fixercapstone-production.up.railway.app/client/verify-email?token=${token}`;

    const mailOptions = {
        from: 'fixit9337@gmail.com',
        to: user.email,
        subject: 'Email Verification',
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`,
    };

    await transporter.sendMail(mailOptions);
}

// Register user and send verification email
const registerUser = async (req, res) => {
    const { email, firstName, lastName, password, street, postalCode, provinceOrState, country } = req.body;

    // Check if user already exists
    const existedUser = await fixerClientObject.fixerClient.findOne({ email });
    if (existedUser) {
        return res.status(400).send({ statusText: 'User already exists' });
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(password, 12);

    try {
        // Create the new user object
        const newUser = await fixerClientObject.fixerClient.create({
            firstName,
            lastName,
            email,
            password: encryptedPassword,
            approved: false,  // Set to false, email must be verified before approval
            accountType: 'client',  // Adjust this to 'client' or any other type
            street,
            postalCode,
            provinceOrState,
            country,
            verified: false,  // Set to false initially, will be updated after verification
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
