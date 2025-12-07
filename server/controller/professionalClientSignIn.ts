/**
 * @module server/controller
 */

import { Request, Response } from "express";

import { ProfessionalRepository } from "../repository/professionalRepository";

interface SignInUserRequest extends Request{
    body:{
        email:string
        password:string
    }
}

//TODO look if can re-use the same method from fixerClientSignIn.ts
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
export const signinUser = async (req:SignInUserRequest, res:Response) => {
    const { email, password } = req.body;


    // Check if user exists and is a professional
    const user = await ProfessionalRepository.findProfessionalByEmail(email);

    if (!user || user.accountType !== 'professional') {
        return res.status(400).send({ statusText: 'User not found' });
    }

    if (!user.verified || !user.password) {
        return res.status(403).send({ statusText: 'Account not verified yet' });
    }

    // Compare password
    const validPassword = await ProfessionalRepository.comparePassword(password, user.password);

    if (!validPassword) {
        return res.status(400).send({ statusText: 'Invalid password' });
    }

    // Create JWT token
    const token = ProfessionalRepository.generateToken({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    });

    await ProfessionalRepository.upsertStreamUser(user);

    const streamToken = ProfessionalRepository.createStreamToken(user._id.toString());
    
    res.send({
        token,
        streamToken,
        userId: user._id.toString(),
        userName: `${user.firstName} ${user.lastName}`
    });
};

