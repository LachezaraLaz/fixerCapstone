const ProfessionalDTO = require('../DTO/professionalDTO');
const professionalRepository = require('../repository/professionalRepository');

const signinUser = async (req, res) => {
    const { email, password } = req.body;
    const professionalData = new ProfessionalDTO({ email, password });

    // Check if user exists and is a professional
    const user = await professionalRepository.findProfessionalByEmail(professionalData.email);
    if (!user || user.accountType !== 'professional') {
        return res.status(400).send({ statusText: 'User not found' });
    }

    if (!user.verified) {
        return res.status(403).send({ statusText: 'Account not verified yet' });
    }

    // Compare password
    const validPassword = await professionalRepository.comparePassword(professionalData.password, user.password);
    if (!validPassword) {
        return res.status(400).send({ statusText: 'Invalid password' });
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
};

module.exports = { signinUser };
