const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('./professionalClientSchema');

// Create user model
const user = mongoose.model("fixerClientInfo");

// Function to handle POST request for user registration
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existedUser = await user.findOne({ email: email });
    if (existedUser) {
        return res.send({ data: 'user already exists' });
    }

    // Hash password
    const encryptedPassword = await bcrypt.hash(password, 12);

    // Try to create new user
    try {
        await user.create({
            username: username,
            email: email,
            password: encryptedPassword,
            approved: false
        });
        res.send({ status: 'success', data: 'user created successfully' });
    } catch (e) {
        res.send({ status: 'error', data: 'user creation failed' });
    }
};

// Export the function
module.exports = { registerUser };
