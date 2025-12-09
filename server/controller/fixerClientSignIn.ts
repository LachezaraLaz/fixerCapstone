/**
 * @module server/controller
 */

import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AuthResponseDto } from "../DTO/userDto";
import { UserRepository } from "../repository/userRepository";
import serverClient from "../services/streamClient";
import { logger } from "../utils/logger";

interface SignInUserRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

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
export const signinUser = async (req: SignInUserRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await UserRepository.findByEmail(email);

  if (!user || user.accountType !== "client" || !user.password)
    return res.status(400).send({ statusText: "User not found" });

  if (!user.verified)
    return res.status(403).send({ statusText: "Account not verified yet" });

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword)
    return res.status(400).send({ statusText: "Invalid password" });

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      street: user.street,
      postalCode: user.postalCode,
      provinceOrState: user.provinceOrState,
      country: user.country,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  await serverClient.upsertUser({
    id: user._id.toString(),
    role: "user",
    name: `${user.firstName} ${user.lastName}`,
  });

  const streamToken = serverClient.createToken(user._id.toString());

  logger.emergency(token);

  const authResponse = new AuthResponseDto({ user, token, streamToken });

  res.send({ status: "success", data: authResponse });
};
