const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { serverClient } = require('../services/streamClient');
const UserRepository = require('../repository/userRepository');
const {AuthResponseDto}  = require('../DTO/userDto');
const { logger } = require("../utils/logger");

const signinUser = async (req, res) => {
    console.log(AuthResponseDto);  // Should NOT be undefined
    logger.info(AuthResponseDto);  // Should NOT be undefined
    const { email, password } = req.body;
    const user = await UserRepository.findByEmail(email);

    if (!user || user.accountType !== 'client') return res.status(400).send({ statusText: 'User not found' });
    if (!user.verified) return res.status(403).send({ statusText: 'Account not verified yet' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send({ statusText: 'Invalid password' });

    const token = jwt.sign({
        id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        street: user.street, postalCode: user.postalCode, provinceOrState: user.provinceOrState, country: user.country
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await serverClient.upsertUser({ id: user._id.toString(), role: 'user', name: `${user.firstName} ${user.lastName}` });

    const streamToken = serverClient.createToken(user._id.toString());
    logger.emergency(token);

    res.send(new AuthResponseDto(user, token, streamToken));
};

module.exports = { signinUser };
