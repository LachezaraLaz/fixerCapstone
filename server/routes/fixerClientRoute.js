const express = require('express');
const { registerUser } = require('../controller/fixerClientRegister');
const { signinUser } = require("../controller/fixerClientSignIn");
const { profile, authenticateJWT } = require('../controller/fixerClientProfile');
const {verifyEmail} = require("../controller/VerifyEmailForClient");
const fixerClientRouter = express.Router();

// Register user route
fixerClientRouter.post('/register', registerUser);
fixerClientRouter.post('/signin', signinUser);
fixerClientRouter.get('/profile', authenticateJWT, profile)
// Email verification route
fixerClientRouter.get('/verify-email', verifyEmail);  // New route for email verification
module.exports = { fixerClientRouter };