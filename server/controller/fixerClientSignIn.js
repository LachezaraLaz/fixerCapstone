const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { serverClient } = require('../services/streamClient');
const fixerClientObject = require('../model/professionalClientModel');

const signinUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists and is a client
    const user = await fixerClientObject.fixerClient.findOne({ email });

    if (!user || user.accountType !== 'client') {
        return res.status(400).send({ statusText: 'User not found' });
    }

    // Check if the user's email is verified
    if (!user.verified) {
        return res.status(403).send({ statusText: 'Account not verified yet' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send({ statusText: 'Invalid password' });
    }

    // Create JWT token with additional fields
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            street: user.street,  // Including street address
            postalCode: user.postalCode,  // Including postal code
            provinceOrState: user.provinceOrState,  // Including province or state
            country: user.country  // Including country
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expiration time
    );

    await serverClient.upsertUser({
        id: user._id.toString(),
        role: 'user',
        name: `${user.firstName} ${user.lastName}`,
    });

    const streamToken = serverClient.createToken(user._id.toString());
    res.send({
        token,
        streamToken,
        userId: user._id.toString(),
        userName: `${user.firstName} ${user.lastName}`
    });
};

module.exports = { signinUser };