/**
 * @module server/controller
 */

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { professionalClient } from "../model/professionalClient";
import { ProfessionalPayment } from "../model/professionalPayment";
import { stripe } from "../utils/stripeConfig";

interface AuthenticateJWTRequest extends Request {
  user?: jwt.JwtPayload | string;
}

export interface ProfileRequest extends Request {
  user?: {
    id: string;
  };
}

interface AddCreditCardRequest extends Request {
  body: {
    professionalId: string;
    paymentMethodId: string;
  };
}

interface GetBankingInfoStatusRequest extends Request {
  user?: {
    id: string;
  };
}

interface GetPaymentMethodRequest extends Request {
  user?: {
    id: string;
  };
}

interface DecodedToken extends jwt.JwtPayload {
  email: string;
}

/**
 * Middleware to authenticate JWT token from the Authorization header.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - Returns a 401 status with a message 'Unauthorized' if no token is provided or if the token is invalid.
 *                     Returns a 403 status with a message 'Forbidden' if the token verification fails.
 *                     Proceeds to the next middleware or route handler if the token is valid.
 */
const authenticateJWT = (
  req: AuthenticateJWTRequest,
  res: Response,
  next: NextFunction
) => {
  // TODO: check if we can re-use the other authenticateJWT function. Should be a middleware anyway when the route is hit
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Token missing" });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden - Invalid token" });
    }

    console.log("Decoded JWT Payload:", user); // Log the decoded token
    req.user = user;
    next();
  });
};

/**
 * Fetches the professional's profile data based on the user ID from the JWT token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing the user ID.
 * @param {string} req.user.id - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const profile = async (req: ProfileRequest, res: Response) => {
  try {
    console.log("JWT Payload (req.user):", req.user); // Log the JWT payload

    // Find the professional by their user ID from the JWT token
    const professional = await professionalClient.findById(req.user?.id);

    if (!professional) {
      return res.status(404).json({ message: "Professional not found" });
    }

    // Respond with professional's data
    res.json(professional);
  } catch (error) {
    console.error("Error fetching professional data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

async function addCreditCard(req: AddCreditCardRequest, res: Response) {
  const { professionalId, paymentMethodId } = req.body;

  try {
    const professionalPayment = await ProfessionalPayment.findOne({
      professionalId,
    });

    if (!professionalPayment) {
      return res
        .status(404)
        .send({ status: "error", data: "Professional not found" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res
        .status(500)
        .send({ status: "error", data: "Missing Stripe API key" });
    }

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: professionalPayment.stripeCustomerId,
    });

    await stripe.customers.update(professionalPayment.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    professionalPayment.paymentMethodId = paymentMethod.id;

    await professionalPayment.save();

    await professionalClient.findByIdAndUpdate(professionalId, {
      bankingInfoAdded: true,
    });

    res.send({ status: "success", data: "Credit card linked successfully" });
  } catch (error) {
    console.error("Error linking credit card:", error);
    res
      .status(500)
      .send({ status: "error", data: "Failed to link credit card" });
  }
}

const getBankingInfoStatus = async (
  req: GetBankingInfoStatusRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User ID missing" });
    }

    const { id } = req.user;
    const professional = await professionalClient.findById(id);

    if (!professional) {
      return res.status(404).json({ message: "Professional not found" });
    }

    res.json({
      bankingInfoAdded: professional.bankingInfoAdded || false,
      bankingInfo: professional.bankingInfo || null,
    });
  } catch (error) {
    console.error("Error fetching banking info status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Fetches the payment method details for a professional.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object containing the user ID.
 * @param {string} req.user.id - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const getPaymentMethod = async (
  req: GetPaymentMethodRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User ID missing" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const professionalPayment = await ProfessionalPayment.findOne({
      professionalId: userId,
    });

    if (!professionalPayment || !professionalPayment.stripeCustomerId) {
      return res.status(404).json({ message: "No payment method found" });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: professionalPayment.stripeCustomerId,
      type: "card",
    });

    if (paymentMethods.data.length === 0) {
      return res.status(404).json({ message: "No payment methods found" });
    }

    const paymentMethod = paymentMethods.data[0];

    if (!paymentMethod.card) {
      return res.status(404).json({ message: "No card payment method found" });
    }

    res.json({
      cardBrand: paymentMethod.card.brand,
      cardLast4: paymentMethod.card.last4,
      expiryDate: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
    });
  } catch (error: any) {
    console.error("Error fetching payment method:", error);
    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({ message: "Invalid Stripe request" });
    }
    res.status(500).json({ message: "Failed to fetch payment method" });
  }
};

const updateProfessionalProfile = async (req: Request, res: Response) => {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Extract user info from token using JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    const userEmail = decoded.email;

    if (!userEmail) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get updated profile data from request body
    const { firstName, lastName } = req.body;

    // Find and update the user - use the same model your profile endpoint uses
    const user = await professionalClient.findOne({
      email: userEmail,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
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

export {
  authenticateJWT,
  profile,
  addCreditCard,
  getBankingInfoStatus,
  getPaymentMethod,
  updateProfessionalProfile,
};
