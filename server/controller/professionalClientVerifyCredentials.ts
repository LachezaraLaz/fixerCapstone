/**
 * @module server/controller
 */

import { professionalClient } from "../model/professionalClient";
import { Request, Response } from "express";

interface VerifyCredentialsRequest extends Request {
  body: {
    tradeLicense: string;
  };
  user: {
    id: string;
  };
}

/**
 * Verifies the professional client's trade license and updates their information.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.tradeLicense - The trade license to be verified.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export const verifyCredentials = async (
  req: VerifyCredentialsRequest,
  res: Response
) => {
  try {
    // Extract the tradeLicense from the request body
    const { tradeLicense } = req.body;

    // Update the professional's information with the trade license (without setting formComplete to true)
    const professional = await professionalClient.findByIdAndUpdate(
      req.user.id,
      { tradeLicense }, // Only update tradeLicense here
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({ message: "Professional not found" });
    }

    res.json({ message: "Trade license submitted successfully", professional });
  } catch (error) {
    console.error("Error verifying trade license:", error);
    res.status(500).json({ message: "Server error" });
  }
};
