const bcrypt = require('bcrypt');
const fixerClientObject = require('../model/professionalClientModel');
const express = require("express");
const app = express();
app.use(express.json());

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existedUser = await fixerClientObject.fixerClient.findOne({ email });
    if (existedUser) {
        return res.status(400).send({ statusText: 'user already exists' });
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(password, 12);

    // Try to create new user
    try {
        await fixerClientObject.fixerClient.create({
            username,
            email,
            password: encryptedPassword,
            approved: false,
            accountType: 'professional'
        });
        res.send({ status: 'success', data: 'user created successfully' });
    } catch (e) {
        res.send({ status: 'error', data: 'user creation failed' });
    }
};

module.exports = { registerUser };
