const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fixerClientObject = require('../model/professionalClientModel');
const { serverClient } = require('../services/streamClient');
dotenv = require('dotenv');
dotenv.config();

/**
 * @module server/repository
 */

class ProfessionalRepository {
    /**
     * Finds a professional by their email.
     *
     * @param {string} email - The email of the professional to find.
     * @returns {Promise<Object|null>} A promise that resolves to the professional object if found, or null if not found.
     */
    async findProfessionalByEmail(email) {
        return await fixerClientObject.fixerClient.findOne({ email });
    }

    /**
     * Creates a new professional using the provided user data.
     *
     * @param {Object} userData - The data of the professional to be created.
     * @param {string} userData.name - The name of the professional.
     * @param {string} userData.email - The email of the professional.
     * @param {string} userData.phone - The phone number of the professional.
     * @param {string} userData.profession - The profession of the professional.
     * @returns {Promise<Object>} The created professional object.
     */
    async createProfessional(userData) {
        return await fixerClientObject.fixerClient.create(userData);
    }

    /**
     * Saves a professional user to the database.
     *
     * @param {Object} user - The user object to be saved.
     * @returns {Promise<Object>} A promise that resolves to the saved user object.
     */
    async saveProfessional(user) {
        return await user.save();
    }

    /**
     * Compares an input password with a stored hashed password.
     *
     * @param {string} inputPassword - The plain text password to compare.
     * @param {string} storedPassword - The hashed password stored in the database.
     * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, otherwise false.
     */
    async comparePassword(inputPassword, storedPassword) {
        return await bcrypt.compare(inputPassword, storedPassword);
    }

    /**
     * Hashes a password using bcrypt with a salt rounds value of 12.
     *
     * @param {string} password - The plain text password to be hashed.
     * @returns {Promise<string>} - A promise that resolves to the hashed password.
     */
    async hashPassword(password) {
        return await bcrypt.hash(password, 12);
    }

    /**
     * Generates a JSON Web Token (JWT) for the given payload.
     *
     * @param {Object} payload - The payload to include in the JWT.
     * @returns {string} The generated JWT.
     */
    generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    }

    /**
     * Generates a JWT verification token for a given user ID.
     *
     * @param {string} userId - The ID of the user for whom the token is being generated.
     * @returns {string} - The generated JWT token.
     */
    generateVerificationToken(userId) {
        return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }

    /**
     * Sends a verification email to the user with a verification link.
     *
     * @param {Object} user - The user object containing user details.
     * @param {string} user.email - The email address of the user.
     * @param {string} token - The verification token to be included in the email.
     * @returns {Promise<void>} - A promise that resolves when the email has been sent.
     */
    async sendVerificationEmail(user, token) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS_RESET,
            },
        });

        const verificationUrl = `https://fixercapstone-production.up.railway.app/professional/verify-email?token=${token}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Email Verification',
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`
        };

        await transporter.sendMail(mailOptions);
    }

    /**
     * Upserts a user in the stream server.
     *
     * @param {Object} user - The user object to be upserted.
     * @param {string} user._id - The unique identifier of the user.
     * @param {string} user.firstName - The first name of the user.
     * @param {string} user.lastName - The last name of the user.
     * @returns {Promise<void>} - A promise that resolves when the user is upserted.
     */
    async upsertStreamUser(user) {
        await serverClient.upsertUser({
            id: user._id.toString(),
            role: 'user',
            name: `${user.firstName} ${user.lastName}`,
        });
    }

    /**
     * Creates a stream token for the given user.
     *
     * @param {string} userId - The ID of the user for whom the token is being created.
     * @returns {string} The generated stream token.
     */
    createStreamToken(userId) {
        return serverClient.createToken(userId.toString());
    }
}

module.exports = new ProfessionalRepository();