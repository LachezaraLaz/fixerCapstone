import bcrypt from "bcrypt";
import moment from "moment";
import nodemailer from "nodemailer";

import { Request, Response } from "express";
import { professionalClient } from "../model/professionalClient";

/**
 * @module server/controller
 */

interface ForgotPasswordRequest extends Request {
  body: {
    email: string;
  };
}

interface ResetPasswordRequest extends Request {
  body: {
    email: string;
    currentPassword: string;
    newPassword: string;
  };
}

interface ValidatePinRequest extends Request {
  body: {
    email: string;
    pin: string;
  };
}

interface ValidateCurrentPasswordRequest extends Request {
  body: {
    email: string;
    currentPassword: string;
  };
}

/**
 * Creates a transporter object using the default SMTP transport.
 * This transporter is configured to use Gmail service with authentication.
 *
 * @constant {Object} transporter - The transporter object for sending emails.
 * @property {string} service - The email service to use (Gmail).
 * @property {Object} auth - The authentication object.
 * @property {string} auth.user - The email address to use for sending emails.
 * @property {string} auth.pass - The password for the email account, retrieved from environment variables.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "fixit9337@gmail.com",
    pass: process.env.PASS_RESET,
  },
});

/**
 * Generates a 6-digit PIN.
 *
 * @returns {string} A randomly generated 6-digit PIN.
 */
export function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit PIN
}

/**
 * Handles the forgot password functionality.
 *
 * This function finds a user by their email address, generates a password reset PIN,
 * stores the PIN and its expiration time in the database, and sends an email with the PIN to the user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email address of the user requesting a password reset.
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>} - A promise that resolves when the function completes.
 *
 * @throws {Error} - Throws an error if the user is not found, or if there is a failure in updating the user or sending the email.
 */
export async function forgotPassword(
  req: ForgotPasswordRequest,
  res: Response
) {
  const user = await professionalClient.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(404).json({ error: "Could not find your account" });
  }

  const pin = generatePin();
  const expiresIn = moment().add(5, "minutes").toISOString(); // Set expiration to 5 minutes from now

  try {
    // Store the PIN and its expiration time
    await professionalClient.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetPin: pin,
          passwordResetExpires: expiresIn, // Store as ISO string
        },
      }
    );

    const mailOptions = {
      from: "fixit9337@gmail.com",
      to: user.email,
      subject: "Password Reset PIN",
      html: `<p>Your password reset PIN is: <strong>${pin}</strong>. It is valid for 5 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset PIN sent" });
  } catch (err) {
    console.error("Failed to update user or send email:", err);
    res
      .status(500)
      .json({ error: "Failed to update user or send password reset email" });
  }
}

// Function to update password (validating old password first)
export async function updatePassword(req: ResetPasswordRequest, res: Response) {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Find user by email
    const user = await professionalClient.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare current password with hashed password stored in database
    if (user.password !== undefined) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await professionalClient.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to validate the PIN
/**
 * Validates the password reset PIN for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.pin - The password reset PIN.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the validation is complete.
 */
export async function validatePin(req: ValidatePinRequest, res: Response) {
  console.log("Received validatePin request:", req.body); // Log the incoming request

  const { email, pin } = req.body; // Change passwordResetPin to pin

  try {
    const user = await professionalClient.findOne({
      email: email,
      passwordResetPin: pin,
      passwordResetExpires: { $gt: moment().toISOString() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid or expired PIN" });
    }

    res
      .status(200)
      .json({ message: `PIN validated successfully for email ${email}` });
  } catch (error) {
    console.error("Error validating PIN:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Resets the user's password.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email of the user requesting the password reset.
 * @param {string} req.body.newPassword - The new password to set for the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the password reset process is complete.
 */
export async function resetPassword(req: ResetPasswordRequest, res: Response) {
  const { email, newPassword } = req.body;

  try {
    const user = await professionalClient.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await professionalClient.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordResetPin: undefined, // Clear the PIN
          passwordResetExpires: undefined, // Clear the expiration
        },
      }
    );

    // Send a confirmation email
    const mailOptions = {
      from: "fixit9337@gmail.com",
      to: user.email,
      subject: "Password Reset Confirmation",
      html: `<p>Your password has been successfully reset. If you did not initiate this request, please contact us immediately.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error during password reset:", err);
    res
      .status(500)
      .json({ error: "An error occurred during the password reset process" });
  }
}

export async function validateCurrentPassword(
  req: ValidateCurrentPasswordRequest,
  res: Response
) {
  const { email, currentPassword } = req.body;
  console.log(`Attempting to validate password for: ${email}`);

  try {
    const user = await professionalClient.findOne({ email });

    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`User found: ${user.email}`);

    // Check if the current password is correct

    if (user.password !== undefined) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    }

    res
      .status(200)
      .json({ message: "Current password validated successfully" });
  } catch (err) {
    console.error("Error validating current password:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
