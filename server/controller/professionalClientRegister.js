const ProfessionalDTO = require('../DTO/professionalDTO');
const professionalRepository = require('../repository/professionalRepository');

dotenv = require('dotenv');
dotenv.config();

// Register user
const registerUser = async (req, res) => {
    const professionalData = ProfessionalDTO.fromRequestBody(req.body);

    // Check if user already exists
    const existedUser = await professionalRepository.findProfessionalByEmail(professionalData.email);
    if (existedUser) {
        return res.status(400).send({ statusText: 'Account already exists' });
    }

    // Hash password
    professionalData.password = await professionalRepository.hashPassword(professionalData.password);

    try {
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
        res.status(500).send({ status: 'error', data: 'User creation failed' });
    }
};

module.exports = { registerUser };
