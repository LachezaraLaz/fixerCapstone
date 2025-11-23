const fixerClientObject = require('../model/professionalClientModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const moment = require('moment'); // Import Moment.js
const {logger} = require("../utils/logger");
const NotFoundError = require("../utils/errors/NotFoundError");
const InternalServerError = require("../utils/errors/InternalServerError");
const UnauthorizedError = require("../utils/errors/UnauthorizedError");

/**
 * @module server/controller
 */

/**
 * Creates a transporter object using the default SMTP transport.
 * This transporter is configured to use Gmail service with authentication.
 * 
 * @constant {Object} transporter - The transporter object for sending emails.
 * @property {string} service - The email service to use (Gmail).
 * @property {Object} auth - The authentication object.
 * @property {string} auth.user - The email address to use for sending emails.
 * @property {string} auth.pass - The password for the email account, retrieved from environment variables.
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fixit9337@gmail.com',
        pass: process.env.PASS_RESET,
    },
});

/**
 * Generates a 6-digit PIN.
 *
 * @returns {string} A randomly generated 6-digit PIN.
 */
function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit PIN
}

/**
 * Handles the forgot password functionality.
 * 
 * This function finds a user by their email address, generates a password reset PIN,
 * stores the PIN and its expiration time in the database, and sends an email with the PIN to the user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email address of the user requesting a password reset.
 * @param {Object} res - The response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the function completes.
 * 
 * @throws {Error} - Throws an error if the user is not found, or if there is a failure in updating the user or sending the email.
 */
async function forgotPassword(req, res, next) {
    try {
        const user = await fixerClientObject.fixerClient.findOne({ email: req.body.email });

        if (!user) {
            throw new NotFoundError('reset', 'Could not find your account', 404);
        }

        const pin = generatePin();
        const expiresIn = moment().add(5, 'minutes').toISOString(); // Set expiration to 5 minutes from now

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
        logger.error('Failed to update user or send email:', err);
        next(new InternalServerError('reset', 'Failed to update user or send password reset email', 500));
    }
}


// Function to update password (validating old password first)
async function updatePassword(req, res) {

    const { email, currentPassword, newPassword } = req.body;

    try {
        // Find user by email
        const user = await fixerClientObject.fixerClient.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare current password with hashed password stored in database
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await fixerClientObject.fixerClient.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                },
            }
        );

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


// Function to validate the PIN
/**
 * Validates the password reset PIN for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.pin - The password reset PIN.
 * @param {Object} res - The response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the validation is complete.
 */
async function validatePin(req, res, next) {
    logger.info('Received validatePin request:', req.body); // Log the incoming request

    const { email, pin } = req.body; // Change passwordResetPin to pin

    try {
        const user = await fixerClientObject.fixerClient.findOne({
            email: email,
            passwordResetPin: pin,
            passwordResetExpires: { $gt: moment().toISOString() }
        });

        if (!user) {
            logger.info('User not found or PIN expired for email:', email);
            throw new UnauthorizedError('reset', 'Invalid or expired PIN', 401);
        }

        logger.info('PIN validated successfully for email:', email);
        res.status(200).json({ message: 'PIN is valid' });
    } catch (error) {
        logger.error('Error validating PIN:', error);
        next(new InternalServerError('reset', 'Internal server error while validating PIN', 500));
    }
}

/**
 * Resets the user's password.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user requesting the password reset.
 * @param {string} req.body.newPassword - The new password to set for the user.
 * @param {Object} res - The response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the password reset process is complete.
 */
async function resetPassword(req, res, next) {
    const { email, newPassword } = req.body;

    try {
        const user = await fixerClientObject.fixerClient.findOne({ email });

        if (!user) {
            throw new NotFoundError('reset', 'User not found', 404);
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
        logger.error('Error during password reset:', err);
        next(new InternalServerError('reset', 'An error occurred during the password reset process', 500));
    }
}

async function validateCurrentPassword(req, res) {
    const { email, currentPassword } = req.body;
    console.log(`Attempting to validate password for: ${email}`);

    try {
        const user = await fixerClientObject.fixerClient.findOne({ email });

        if (!user) {
            console.log(`User not found with email: ${email}`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`User found: ${user.email}`);

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        console.log(`Password match result: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        res.status(200).json({ message: 'Current password validated successfully' });
    } catch (err) {
        console.error('Error validating current password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { forgotPassword, validatePin, resetPassword, updatePassword, validateCurrentPassword };
