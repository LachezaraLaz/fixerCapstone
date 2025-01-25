const express = require('express');
const { getUserProfile } = require('../controller/userController');
const userRouter = express.Router();

userRouter.get('/user/:email', getUserProfile);

module.exports = { userRouter };
