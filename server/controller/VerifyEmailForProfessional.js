const jwt = require('jsonwebtoken');
const { fixerClient } = require('../model/professionalClientModel');
const dotenv = require('dotenv');
const BadRequestError = require("../utils/errors/BadRequestError");
const NotFoundError = require("../utils/errors/NotFoundError");

/**
 * @module server/controller
 */

dotenv.config();

function generateResponsePage(title, message, success) {
    const color = success ? '#FF6B00' : '#FF3333';
    const iconHTML = success
        ? `<div class="checkmark-wrapper">
                <div class="checkmark-circle"></div>
           </div>`
        : `<div class="error-icon">✖</div>`;

    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background: linear-gradient(to bottom right, #fff6f0, #fff);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 40px 30px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }

        /* Checkmark Circle */
        .checkmark-wrapper {
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .checkmark-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: #FF6B00;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pop 0.4s ease-out forwards;
        }

        .checkmark-circle::before {
            content: '';
            width: 20px;
            height: 45px;
            border-right: 5px solid white;
            border-bottom: 5px solid white;
            transform: rotate(45deg) scale(0);
            transform-origin: bottom left;
            animation: draw-check 0.3s ease-out 0.4s forwards;
            position: absolute;
            bottom: 40px;
            left: 28px;
        }

        @keyframes draw-check {
            0% {
                transform: rotate(45deg) scale(0);
            }
            100% {
                transform: rotate(45deg) scale(1);
            }
        }

        @keyframes pop {
            0% {
                transform: scale(0.8);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .error-icon {
            font-size: 60px;
            color: ${color};
            margin-bottom: 20px;
            animation: shake 0.3s ease-in-out;
        }

        @keyframes shake {
            0% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            100% { transform: translateX(0); }
        }

        h1 {
            color: ${color};
            font-size: 24px;
            margin-bottom: 10px;
        }

        p {
            color: #555;
            font-size: 16px;
            margin-bottom: 30px;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${color};
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background-color 0.3s ease;
        }

        .btn:hover {
            background-color: ${success ? '#e85e00' : '#cc0000'};
        }

    </style>
</head>
<body>
    <div class="container">
        ${iconHTML}
        <h1>${title}</h1>
        <p>${message}</p>
    </div>
</body>
</html>
    `;
}

/**
 * Verifies the email of a professional user based on the provided token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters of the request.
 * @param {string} req.query.token - The verification token.
 * @param {Object} res - The response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Promise<void>} - A promise that resolves when the email verification process is complete.
 */
async function verifyEmail(req, res, next) {
    try {
        const { token } = req.query;  // Extract token from the query params

        if (!token) {
            throw new BadRequestError('pro email verification', 'No verification token provided.', 400);
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Find the user by ID
        const user = await fixerClient.findById(userId);
        if (!user) {
            throw new NotFoundError('pro email verification', 'Account not found.', 404);
        }

        // If the user is already verified, return a message
        if (user.verified) {
            return res.send(generateResponsePage('Already Verified', 'Your email is already verified. You can log in now.', true));
        }

        // If the token doesn't match or has expired, return an error
        if (user.verificationToken !== token) {
            throw new BadRequestError('pro email verification', 'Invalid or expired token.', 400);
        }

        // Mark the user as verified
        user.verified = true;
        user.verificationToken = undefined;  // Clear the token once it's verified
        await user.save();

        res.send(generateResponsePage('Verification Successful', 'Your email has been successfully verified! You can now log in using the app.', true));
    } catch (error) {
        console.error(error);
        next(new BadRequestError('pro email verification', 'Invalid or expired token.', 400));
    }
}

module.exports = { verifyEmail };
