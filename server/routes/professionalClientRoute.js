const express = require('express');
const { registerUser } = require('../controller/professionalClientRegister');
const { signinUser } = require('../controller/professionalClientSignIn');
const { profile, authenticateJWT } = require('../controller/professionalClientProfile');
const { verifyCredentials } = require('../controller/professionalClientVerifyCredentials');
const { professionalUploadID } = require('../controller/professionalUploadID');
const professionalRouter = express.Router();

// Register user route
professionalRouter.post('/register', registerUser);
professionalRouter.post('/signin', signinUser);
professionalRouter.get('/profile', authenticateJWT, profile);
professionalRouter.post('/verify', authenticateJWT, verifyCredentials);
professionalRouter.post('/uploadID', authenticateJWT, professionalUploadID);

module.exports = { professionalRouter };
