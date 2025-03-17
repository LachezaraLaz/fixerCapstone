const ProfessionalDTO = require('../DTO/professionalDTO');
const professionalRepository = require('../repository/professionalRepository');
const AppError = require('../utils/AppError');

/**
 * @module server/controller
 */

dotenv = require('dotenv');
dotenv.config();

/**
 * Registers a new professional user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing user data.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is registered.
 *
 * @throws {Error} - Throws an error if user creation fails.
 */
const registerUser = async (req, res) => {
    try {
        const professionalData = ProfessionalDTO.fromRequestBody(req.body);

        // Check if user already exists
        const existedUser = await professionalRepository.findProfessionalByEmail(professionalData.email);
        if (existedUser) {
            throw new AppError('Account already exists', 400);
        }

        // Hash password
        professionalData.password = await professionalRepository.hashPassword(professionalData.password);

        // Create the new user object
        const newUser = await professionalRepository.createProfessional(professionalData);

        // Generate the verification token
        const verificationToken = professionalRepository.generateVerificationToken(newUser._id);

        // Save the verification token to the user's record
        newUser.verificationToken = verificationToken;
        await professionalRepository.saveProfessional(newUser);

        // Send the verification email
        await professionalRepository.sendVerificationEmail(newUser, verificationToken);

        res.send({ status: 'success', data: 'Account created successfully. Please check your email to verify your account.' });
    } catch (e) {
        console.error(e);
        next(new AppError(`User creation failed: ${e.message}`, 500));
    }
};

module.exports = { registerUser };
