const express = require('express');
const { registerUser } = require('../controller/professionalClientRegister');
const { signinUser } = require('../controller/professionalClientSignIn');
const professionalRouter = express.Router();

// Register user route
professionalRouter.post('/register', registerUser);
professionalRouter.post('/signin', signinUser);

module.exports = { professionalRouter };