/**
 * @module server/controller
 */

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { fixerClient } from "../model/fixerClient";

interface JwtUserPayload {
  id?: string;
  email: string;
}

interface UpdateProfile extends Request {
  body: {
    firstName?: string;
    lastName?: string;
    street?: string;
    postalCode?: string;
    provinceOrState?: string;
    country?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "";

// TODO: Check if can re-use same authnticate JWT
/**
 * Middleware to authenticate JWT token from the request headers.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.headers - Request headers.
 * @param {string} req.headers.authorization - Authorization header containing the JWT token.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - Returns a 401 status with a message 'Unauthorized' if no token is provided or if the token is invalid.
 *                     Returns a 403 status with a message 'Forbidden' if the token verification fails.
 *                     Proceeds to the next middleware or route handler if the token is valid.
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers.authorization; // Get authorization header

  if (!authorizationHeader) {
    return res.status(401).json({ message: "Unauthorized" }); // No token provided
  }

  const token = authorizationHeader.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // No token
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" }); // Token invalid
    }
    req.user = user as JwtUserPayload;
    next(); // Proceed to the next middleware or route handler
  });
};

/**
 * Fetches the profile of a client based on the user ID from the JWT token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing the user ID.
 * @param {string} req.user.id - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {Error} - If there is an error fetching the client data.
 */
export const profile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: "Id not provided" });
    }

    // Find the professional by their user ID from the JWT token
    const client = await fixerClient.findById(req.user.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Respond with professional's data
    res.json(client);
  } catch (error) {
    console.error("Error fetching client data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: UpdateProfile, res: Response) => {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    // Extract user info from token using JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    const userEmail = decoded.email;

    if (!userEmail) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get updated profile data from request body
    const {
      firstName,
      lastName,
      street,
      postalCode,
      provinceOrState,
      country,
    } = req.body;

    // Find and update the user - use the same model your profile endpoint uses
    const user = await fixerClient.findOne({
      email: userEmail,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (street !== undefined) user.street = street;
    if (postalCode !== undefined) user.postalCode = postalCode;
    if (provinceOrState !== undefined) user.provinceOrState = provinceOrState;
    if (country !== undefined) user.country = country;

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        street: user.street,
        postalCode: user.postalCode,
        provinceOrState: user.provinceOrState,
        country: user.country,
      },
    });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
