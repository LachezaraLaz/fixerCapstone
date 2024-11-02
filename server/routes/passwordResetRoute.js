const express = require('express');
const resetPasswordRouter = express.Router();
const { forgotPassword, resetPassword } = require('../controller/resetController');

// Route to request password reset
resetPasswordRouter.post('/requestPasswordReset', forgotPassword);

// Route to reset password
resetPasswordRouter.post('/resetPassword', resetPassword);

module.exports = { resetPasswordRouter };