import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { fixerClient, IFixerClient } from "../model/fixerClient";
import {
  IProfessionalClient,
  professionalClient,
} from "../model/professionalClient";

/**
 * @module server/controller
 */

interface AuthenticatedRequest extends Request {
  user?: IFixerClient | IProfessionalClient;
  userType?: "client" | "professional";
}

/**
 * Middleware to authenticate JWT tokens.
 *
 * This middleware checks for the presence of an authorization header,
 * verifies the JWT token, and attaches the user data to the request object.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.headers - The headers of the request.
 * @param {string} req.headers.authorization - The authorization header containing the JWT token.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @returns {Object} - Returns a response with status 401 if the authorization header or token is missing,
 *                     status 403 if the token verification fails,
 *                     status 404 if the user is not found,
 *                     or status 500 if there is a server error.
 *
 * @throws {Error} - Throws an error if there is an issue with the authentication process.
 */
export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const decoded = decodedToken as { id: string };

    try {
      // Check if the user is a client
      let user = await fixerClient.findById(decoded.id);

      if (!user) {
        // If not a client, check if the user is a professional
        user = await professionalClient.findById(decoded.id);
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Attach user data and user type to the request for use in other routes
      req.user = user;
      req.userType = user instanceof fixerClient ? "client" : "professional"; //TODO enum for client/professional
      next();
    } catch (error) {
      console.error("Error in authentication:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
};
