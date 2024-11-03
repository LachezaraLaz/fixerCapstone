const fixerClientObject = require('../model/professionalClientModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const moment = require('moment'); // Import Moment.js

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fixit9337@gmail.com',
        pass: process.env.PASS_RESET,
    },
});

// Function to generate a random 6-digit PIN
function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit PIN
}

// Function to handle forgot password
async function forgotPassword(req, res) {
    const user = await fixerClientObject.fixerClient.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ error: 'Could not find your account'});
    }

    const pin = generatePin();
    const expiresIn = moment().add(5, 'minutes').toISOString(); // Set expiration to 5 minutes from now

    try {
        // Store the PIN and its expiration time
        await fixerClientObject.fixerClient.updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordResetPin: pin,
                    passwordResetExpires: expiresIn, // Store as ISO string
                },
            }
        );

        const mailOptions = {
            from: 'fixit9337@gmail.com',
            to: user.email,
            subject: 'Password Reset PIN',
            html: `<p>Your password reset PIN is: <strong>${pin}</strong>. It is valid for 5 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset PIN sent' });
    } catch (err) {
        console.error('Failed to update user or send email:', err);
        res.status(500).json({ error: 'Failed to update user or send password reset email' });
    }
}

// Function to validate the PIN
async function validatePin(req, res) {
    console.log('Received validatePin request:', req.body); // Log the incoming request

    const { email, pin } = req.body; // Change passwordResetPin to pin

    try {
        const user = await fixerClientObject.fixerClient.findOne({
            email: email,
            passwordResetPin: pin,
            passwordResetExpires: { $gt: moment().toISOString() }
        });

        if (!user) {
            console.log('User not found or PIN expired for email:', email);
            return res.status(401).json({ error: 'Invalid or expired PIN' });
        }

        console.log('PIN validated successfully for email:', email);
        res.status(200).json({ message: 'PIN is valid' });
    } catch (error) {
        console.error('Error validating PIN:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// Function to reset password
async function resetPassword(req, res) {
    const { email, newPassword } = req.body;

    try {
        const user = await fixerClientObject.fixerClient.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await fixerClientObject.fixerClient.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    passwordResetPin: undefined, // Clear the PIN
                    passwordResetExpires: undefined, // Clear the expiration
                },
            }
        );

        // Send a confirmation email
        const mailOptions = {
            from: 'fixit9337@gmail.com',
            to: user.email,
            subject: 'Password Reset Confirmation',
            html: `<p>Your password has been successfully reset. If you did not initiate this request, please contact us immediately.</p>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Error during password reset:', err);
        res.status(500).json({ error: 'An error occurred during the password reset process' });
    }
}

module.exports = { forgotPassword, validatePin, resetPassword };
