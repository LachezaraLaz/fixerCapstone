const fixerClientObject = require('../model/professionalClientModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fixit9337@gmail.com',
        pass: process.env.PASS_RESET
    },
});

async function forgotPassword(req, res) {
    // Find the user by email
    const user = await fixerClientObject.fixerClient.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Generate a password reset token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    try {
        // Update the user's password reset token and expiration
        await fixerClientObject.fixerClient.updateOne(
            { _id: user._id }, // Filter
            {
                $set: {
                    passwordResetToken: token,
                    passwordResetExpires: Date.now() + 3600000 // 1 hour
                }
            }
        );

        // Send the password reset email
        const resetUrl = `${req.headers.host}/reset/resetPassword?token=${token}`;
        const mailOptions = {
            from: 'fixit9337@gmail.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error('Failed to update user or send email:', err);
        res.status(500).json({ error: 'Failed to update user or send password reset email' });
    }
}


async function resetPassword(req, res) {
    try {
        // Validate the password reset token
        const token = req.query.token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by their ID and check if the token is valid
        const user = await fixerClientObject.fixerClient.findOne({
            _id: decodedToken.id,
            passwordResetToken: token,
            email: decodedToken.email
        });
        console.log('Decoded Token:', token);
        console.log('Decoded Token:', decodedToken);
        console.log('Current Time:', Date.now());

        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired password reset token' });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        await user.updateOne(
            {
                email: user.email,
            },
            {
                $set: {
                    password: hashedPassword,
                },
            }
        );

        // Update the user's password and remove the reset token and its expiration date
        user.password = hashedPassword; // Use hashed password
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({password:hashedPassword,passwordResetExpires:undefined});

        // Send a confirmation email
        const mailOptions = {
            from: 'fixit9337@gmail.com',
            to: user.email,
            subject: 'Password Reset Confirmation',
            html: `
                <p>Your password has been successfully reset. If you did not initiate this request, please contact us immediately.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Error during password reset:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        }
        res.status(500).json({ error: 'An error occurred during the password reset process' });
    }
}

module.exports = {forgotPassword, resetPassword};