const express = require('express');
const { getUserProfile } = require('../controller/userController');
const userRouter = express.Router();


userRouter.get('/user/:email', getUserProfile);
userRouter.get('/test', (req, res) => {
    console.log('Test route reached');
    res.json({ message: 'Test route works' });
});

module.exports = { userRouter };