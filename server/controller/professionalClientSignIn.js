const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fixerClientObject = require('../model/professionalClientModel');

const signinUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists and is a professional
    const user = await fixerClientObject.fixerClient.findOne({ email });
    if (!user || user.accountType !== 'professional') {
        return res.status(400).send({ statusText: 'User not found' });
    }

    if(!user.verified){
        return res.status(403).send({ statusText: 'Account not verified yet' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send({ statusText: 'Invalid password' });
    }

    // Create JWT token
    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token validation time
    );

    res.send({ token });
};

module.exports = { signinUser };
