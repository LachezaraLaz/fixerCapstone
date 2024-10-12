const express = require('express');
const { registerUser } = require('../controller/professionalClientRegister');
const professionalRouter = express.Router();

// Register user route
professionalRouter.post('/', registerUser);

module.exports = { professionalRouter };
