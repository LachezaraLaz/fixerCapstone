/**
 * @module server/controller
 */

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { IJob, JobStatus } from "../model/job";
import { Quote, QuoteStatus } from "../model/quote";

interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload | string;
}

interface GetMyProfessionalJobsRequest extends Request {
  user: {
    email: string;
  };
}
//TODO look if we need to keep this method or re-use the one in authenticate.ts
/**
 * Middleware to authenticate JWT token from the request headers.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - Returns a 401 status with 'Unauthorized' message if no token is provided.
 *                     Returns a 403 status with 'Forbidden' message if token verification fails.
 *                     Proceeds to the next middleware if token is valid.
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
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log("User data from token:", user); // Log user data
    req.user = user;
    next();
  });
};

/**
 * Retrieves the professional's jobs based on their email from the JWT.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object from the JWT.
 * @param {string} req.user.email - The email of the professional.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @description This function fetches all quotes associated with the professional's email,
 * categorizes them by status (all, done, pending, active), calculates the total amount earned,
 * and sends the categorized jobs and amount earned as a JSON response.
 *
 * @throws {Error} - If an error occurs while fetching the jobs, a 500 status code and an error message are sent.
 */
export const getMyProfessionalJobs = async (
  req: GetMyProfessionalJobsRequest,
  res: Response
) => {
  const professionalEmail = req.user.email;

  try {
    // Find quotes and only populate non-deleted jobs
    const quotes = await Quote.find({ professionalEmail }).populate("issueId");

    let amountEarned = 0;
    const jobsByStatus = {
      all: [] as Partial<IJob>[],
      done: [] as Partial<IJob>[],
      pending: [] as Partial<IJob>[],
      active: [] as Partial<IJob>[],
      amountEarned: 0,
    };

    // Filter out quotes with null issueId (deleted jobs)
    const validQuotes = quotes.filter((quote) => quote.issueId !== null);

    validQuotes.forEach((quote) => {
      // Additional null check as safety net
      if (!quote.issueId || typeof quote.issueId === "string") return;

      //TODO: Check if I didn't break anything with this conversion
      const job = quote.issueId as IJob;

      const jobDetails: Partial<IJob> = {
        id: quote.issueId._id,
        title: job.title || "No title",
        description: job.description || "No description",
        professionalNeeded: job.professionalNeeded || "No Professional",
        // price: quote.price, TODO: job don't have a price field
        status: quote.status.toString(),
        rating: job.rating || 1,
        imageUrl: job.imageUrl || "https://via.placeholder.com/100",
      };

      if (
        quote.status === QuoteStatus.ACCEPTED &&
        job.status === JobStatus.IN_PROGRESS
      ) {
        jobsByStatus.active.push(jobDetails);
        jobsByStatus.all.push(jobDetails);
      } else if (
        quote.status === QuoteStatus.PENDING &&
        job.status === JobStatus.OPEN
      ) {
        jobsByStatus.pending.push(jobDetails);
        jobsByStatus.all.push(jobDetails);
      } else if (
        quote.status === QuoteStatus.DONE ||
        (quote.status === QuoteStatus.ACCEPTED &&
          job.status === JobStatus.COMPLETED)
      ) {
        jobsByStatus.done.push(jobDetails);
        jobsByStatus.all.push(jobDetails);
        amountEarned += quote.price;
      }
    });

    jobsByStatus.amountEarned = amountEarned;
    res.status(200).json(jobsByStatus);
  } catch (error: any) {
    console.error("Error fetching professional jobs:", error);
    res.status(500).json({
      error: "An error occurred while fetching jobs.",
      details: error.message,
    });
  }
};
