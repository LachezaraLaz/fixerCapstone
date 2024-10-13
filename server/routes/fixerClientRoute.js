const express = require('express');
const { registerUser } = require('../controller/fixerClientRegister');
const fixerClientRouter = express.Router();

// Register user route
fixerClientRouter.post('/', registerUser);

module.exports = { fixerClientRouter };