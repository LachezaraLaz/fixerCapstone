import { Request, Response } from "express";

import { Notification } from "../model/notification";
import { Jobs } from "../model/job";

import { fixerClient } from "../model/fixerClient";
import { getCoordinatesFromAddress } from "../services/geoCodingService";
import { logger } from "../utils/logger";

/**
 * @module server/controller
 */

/**
 * Creates a new issue based on the provided request data.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.title - The title of the issue.
 * @param {string} req.body.description - The description of the issue.
 * @param {string} req.body.professionalNeeded - The type of professional needed for the issue.
 * @param {string} req.body.email - The email of the user creating the issue.
 * @param {string} [req.body.status='open'] - The status of the issue (default is 'open').
 * @param {Object} req.file - The file object containing the uploaded image (optional).
 * @param {Object} res - The response object.
 *
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 *
 * @throws {Error} - Throws an error if the issue creation fails.
 */
const createIssue = async (req: Request, res: Response) => {
  const {
    title,
    description,
    professionalNeeded,
    email,
    status = "open",
    timeline,
    address,
  } = req.body;
  let imageUrl = null;

  if (!title || !description || !professionalNeeded || !address) {
    return res
      .status(400)
      .json({ message: "Some required fields are missing." });
  }

  // if (req.file) {
  //   imageUrl = req.file.path;
  // }

  try {
    const clientInfo = await fixerClient.findOne({ email });

    if (!clientInfo) {
      return res.status(404).json({ message: "Client information not found" });
    }

    // const address = `${clientInfo.street}, ${clientInfo.postalCode}, ${clientInfo.provinceOrState}, ${clientInfo.country}`;
    const { latitude, longitude } = await getCoordinatesFromAddress(address);

    const newIssue = await Jobs.create({
      title,
      description,
      professionalNeeded,
      imageUrl,
      userEmail: email,
      status,
      latitude,
      longitude,
      firstName: clientInfo.firstName,
      lastName: clientInfo.lastName,
      timeline,
    });

    // Create a notification for the issue creator
    const notification = new Notification({
      userId: clientInfo._id, // Use the client's ID
      message: `🎉 Congrats! Your issue titled "${title}" has been created successfully.`,
      isRead: false,
    });

    await notification.save();

    res
      .status(201)
      .json({ message: "Issue created successfully", issue: newIssue });
    logger.info("Issue created successfully");
    logger.warn("test pino create issue");
  } catch (error: any) {
    logger.error("Error occurred while creating issue:", error);
    res
      .status(500)
      .json({ message: "Failed to create issue", error: error.message });
  }
};

module.exports = { createIssue };
