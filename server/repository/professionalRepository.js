const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fixerClientObject = require('../model/professionalClientModel');
const { serverClient } = require('../services/streamClient');
dotenv = require('dotenv');
dotenv.config();

class ProfessionalRepository {
    async findProfessionalByEmail(email) {
        return await fixerClientObject.fixerClient.findOne({ email });
    }

    async createProfessional(userData) {
        return await fixerClientObject.fixerClient.create(userData);
    }

    async saveProfessional(user) {
        return await user.save();
    }

    async comparePassword(inputPassword, storedPassword) {
        return await bcrypt.compare(inputPassword, storedPassword);
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, 12);
    }

    generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    }

    generateVerificationToken(userId) {
        return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }

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

    async upsertStreamUser(user) {
        await serverClient.upsertUser({
            id: user._id.toString(),
            role: 'user',
            name: `${user.firstName} ${user.lastName}`,
        });
    }

    createStreamToken(userId) {
        return serverClient.createToken(userId.toString());
    }
}

module.exports = new ProfessionalRepository();