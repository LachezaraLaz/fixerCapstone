const fixerClientObject = require('../model/professionalClientModel');
const nodemailer = require('nodemailer');
const moment = require('moment'); // Import Moment.js

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
 * Sends a report about a professional.
 *
 * This function processes the report details, creates the email content, and sends an email
 * to the specified professional or admin regarding the issue.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.description - The description of the issue being reported.
 * @param {string} req.body.date - The date of the report.
 * @param {string} req.body.issue - The issue ID or title.
 * @param {string} req.body.professionalName - The professional's name or email being reported.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the report is sent.
 */
async function sendEmailReport(req, res) {
    const { description, date, issue, professionalName } = req.body;

    // Validation: Ensure all required fields are provided
    if (!description || !date || !professionalName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Send email to admin or professional
        const mailOptions = {
            from: 'fixit9337@gmail.com',
            to: 'fixit9337@gmail.com',  // You can replace this with the professional's email or a recipient list
            subject: `New Issue Report: ${issue}`,
            html: `
                <p>A new issue report has been submitted.</p>
                <p><strong>Issue:</strong> ${issue}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Professional:</strong> ${professionalName}</p>
            `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Report sent successfully' });
    } catch (err) {
        console.error('Error sending report email:', err);
        res.status(500).json({ error: 'Error sending report email' });
    }
}

/**
 * Validates the issue being reported.
 *
 * This function checks if the issue exists in the database before allowing the report submission.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.issue - The issue being reported.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves if the issue is valid.
 */
async function validateIssue(req, res) {
    const { issue } = req.body;

    try {
        const existingIssue = await fixerClientObject.fixerClient.findOne({ _id: issue });

        if (!existingIssue) {
            return res.status(404).json({ error: 'Invalid issue ID' });
        }

        // If the issue exists, return success
        res.status(200).json({ message: 'Issue is valid' });
    } catch (err) {
        console.error('Error validating issue:', err);
        res.status(500).json({ error: 'Error validating issue' });
    }
}

module.exports = { sendEmailReport, validateIssue };
