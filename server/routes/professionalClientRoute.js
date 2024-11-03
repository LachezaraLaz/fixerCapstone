const express = require('express');
const { registerUser } = require('../controller/professionalClientRegister');
const { signinUser } = require('../controller/professionalClientSignIn');
const { profile, authenticateJWT } = require('../controller/professionalClientProfile');
const { verifyCredentials } = require('../controller/professionalClientVerifyCredentials');
const { professionalUploadID } = require('../controller/professionalUploadID');
const { upload } = require('../services/cloudinaryService');  // Import the Cloudinary upload service
const { forgotPassword, resetPassword } = require('../controller/resetController');
const professionalRouter = express.Router();

// Register user route
professionalRouter.post('/register', registerUser);
professionalRouter.post('/signin', signinUser);
professionalRouter.get('/profile', authenticateJWT, profile);
professionalRouter.post('/verify', authenticateJWT, verifyCredentials);

// Password reset routes
//professionalRouter.post('/reset/resetPassword', resetPassword); // Route to reset the password

// Upload middleware before calling the controller
professionalRouter.post('/uploadID', authenticateJWT, upload('professional_ids').single('idImage'), professionalUploadID);

module.exports = { professionalRouter };
