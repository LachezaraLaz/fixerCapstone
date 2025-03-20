const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { serverClient } = require('../services/streamClient');
const UserRepository = require('../repository/userRepository');
const {AuthResponseDto}  = require('../DTO/userDto');
const { logger } = require("../utils/logger");
const BadRequestError = require("../utils/errors/BadRequestError");
const ForbiddenError = require("../utils/errors/ForbiddenError");

/**
 * @module server/controller
 */

/**
 * Signs in a user with the provided email and password.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response with the authentication token and user details.
 */
const signinUser = async (req, res) => {
    try {
        logger.info(AuthResponseDto);  // Should NOT be undefined
        logger.info(AuthResponseDto);  // Should NOT be undefined
        const { email, password } = req.body;
        const user = await UserRepository.findByEmail(email);

        if (!user || user.accountType !== 'client') throw new BadRequestError('client sign in', 'User not found', 400);

        if (!user.verified) throw new ForbiddenError('client sign in', 'Account not verified yet', 403);


        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new BadRequestError('client sign in', 'Invalid password', 400);

        const token = jwt.sign({
            id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName,
            street: user.street, postalCode: user.postalCode, provinceOrState: user.provinceOrState, country: user.country
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        await serverClient.upsertUser({ id: user._id.toString(), role: 'user', name: `${user.firstName} ${user.lastName}` });

        const streamToken = serverClient.createToken(user._id.toString());
        logger.emergency(token);

        res.send(new AuthResponseDto(user, token, streamToken));
    } catch (error) {
        next(error); // custom error handler
    }
};

module.exports = { signinUser };
