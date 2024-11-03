const express = require('express');
const resetPasswordRouter = express.Router();
const { forgotPassword, resetPassword, validatePin} = require('../controller/resetController');

// Route to request password reset
resetPasswordRouter.post('/requestPasswordReset', forgotPassword);

//resetPasswordRouter.post('/resetPassword', resetPassword);
resetPasswordRouter.post('/validatePin', validatePin);
resetPasswordRouter.post('/updatePassword', resetPassword);

module.exports = { resetPasswordRouter };