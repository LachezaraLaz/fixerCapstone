const ProfessionalDTO = require('../DTO/professionalDTO');
const professionalRepository = require('../repository/professionalRepository');
const AppError = require('../utils/AppError');

/**
 * @module server/controller
 */

/**
 * Handles the sign-in process for professional users.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the professional user.
 * @param {string} req.body.password - The password of the professional user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response with the JWT token, stream token, user ID, and user name if successful.
 */
const signinUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const professionalData = new ProfessionalDTO({ email, password });

        // Check if user exists and is a professional
        const user = await professionalRepository.findProfessionalByEmail(professionalData.email);
        if (!user || user.accountType !== 'professional') {
            throw new AppError('User not found', 400);
        }

        if (!user.verified) {
            throw new AppError('Account not verified yet', 403);
        }

        // Compare password
        const validPassword = await professionalRepository.comparePassword(professionalData.password, user.password);
        if (!validPassword) {
            throw new AppError('Invalid password', 400);
        }

        // Create JWT token
        const token = professionalRepository.generateToken({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });

        await professionalRepository.upsertStreamUser(user);

        const streamToken = professionalRepository.createStreamToken(user._id);
        res.send({
            token,
            streamToken,
            userId: user._id.toString(),
            userName: `${user.firstName} ${user.lastName}`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { signinUser };
