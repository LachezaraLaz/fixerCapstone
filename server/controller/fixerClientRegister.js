const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const UserRepository = require('../repository/userRepository');
const { RegisterUserDto } = require('../DTO/userDto');

/**
 * @module server/controller/fixerClientRegister
 */

dotenv.config();

/**
 * Sends a verification email to the user with a verification token.
 *
 * @param {Object} user - The user object containing user details.
 * @param {string} user.email - The email address of the user.
 * @param {string} token - The verification token to be included in the email.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
async function sendVerificationEmail(user, token) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'fixit9337@gmail.com', pass: process.env.PASS_RESET },
    });

    const verificationUrl = `https://fixercapstone-production.up.railway.app/client/verify-email?token=${token}`;
    const mailOptions = {
        from: 'fixit9337@gmail.com',
        to: user.email,
        subject: 'Email Verification',
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    };

    await transporter.sendMail(mailOptions);
}

/**
 * Registers a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing user details.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is registered.
 *
 * @throws {Error} - If user creation fails.
 */
const registerUser = async (req, res) => {
    const userDto = new RegisterUserDto(req.body);
    const existedUser = await UserRepository.findByEmail(userDto.email);

    if (existedUser) return res.status(400).send({ statusText: 'User already exists' });

    userDto.password = await bcrypt.hash(userDto.password, 12);
    userDto.approved = false;
    userDto.accountType = 'client';
    userDto.verified = false;

    try {
        const newUser = await UserRepository.createUser(userDto);
        const verificationToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await UserRepository.updateUser(newUser._id, { verificationToken });
        await sendVerificationEmail(newUser, verificationToken);

        res.send({ status: 'success', data: 'Account created successfully. Check your email to verify your account.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', data: 'User creation failed' });
    }
};

module.exports = { registerUser };
