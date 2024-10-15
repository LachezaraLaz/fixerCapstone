const express = require('express');
const { registerUser } = require('../controller/fixerClientRegister');
const {signinUser} = require("../controller/fixerClientSignIn");
const fixerClientRouter = express.Router();

// Register user route
fixerClientRouter.post('/register', registerUser);
fixerClientRouter.post('/signin', signinUser);

module.exports = { fixerClientRouter };