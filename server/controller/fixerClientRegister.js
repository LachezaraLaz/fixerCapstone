const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const UserRepository = require('../../server/controller/userRepository');
const { RegisterUserDto } = require('../../server/controller/userDto');

dotenv.config();

// Send email verification
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

// Register User Function
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
