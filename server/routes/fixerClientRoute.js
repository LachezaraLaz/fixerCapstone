const express = require('express');
const { registerUser } = require('../controller/fixerClientRegister');
const { verifyAddress } = require('../controller/fixerClientVerifyAddress');
const { signinUser } = require("../controller/fixerClientSignIn");
const { profile, authenticateJWT } = require('../controller/fixerClientProfile');
const fixerClientRouter = express.Router();

// Register user route
fixerClientRouter.post('/register', registerUser);
fixerClientRouter.post('/verifyAddress', verifyAddress)
fixerClientRouter.post('/signin', signinUser);
fixerClientRouter.get('/profile', authenticateJWT, profile)

module.exports = { fixerClientRouter };