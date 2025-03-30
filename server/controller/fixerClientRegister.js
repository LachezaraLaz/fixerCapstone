const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const UserRepository = require('../repository/userRepository');
const { RegisterUserDto } = require('../DTO/userDto');

/**
 * @module server/controller
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
        subject: 'Fixr Email Verification',
        html: `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Confirmation</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #ff7f00;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
            color: #333333;
            font-size: 16px;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            padding: 14px 28px;
            background-color: #ff7f00;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px auto;
            text-align: center;
            display: block;
            width: 200px;
        }
        .btn:hover {
            background-color: #e66b00;
        }
        .footer {
            font-size: 12px;
            color: #777777;
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .logo {
            text-align: center;
            margin-top: 20px;
        }
        .logo img {
            width: 150px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color:white;">Welcome to Fixit</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up with <strong>Fixit</strong>! Please confirm your email address to complete your registration and start using our services.</p>
            <p style="text-align: center;">
                <a class="btn" href="${verificationUrl}">Verify My Email</a>
            </p>
            <p>If you did not sign up for this account, you can safely ignore this email.</p>
            <br>
            <p>Thanks,<br>The Fixit Team</p>
            <div class="logo">
                <img src="https://i.postimg.cc/W3ddyG99/medium-shot-man-posing-studio-1.png" alt="Fixit Logo" />
            </div>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Fixit. All rights reserved.
        </div>
    </div>
</body>
</html>
  `,
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
