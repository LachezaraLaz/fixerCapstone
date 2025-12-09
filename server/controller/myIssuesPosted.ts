import { Request, Response } from "express";

import {
  getJobsByUserEmail,
  updateJobStatus,
  getJobByIdRepo,
} from "../repository/jobRepository";

import { IJob, Job } from "../model/job";
import { jobDTO } from "../DTO/jobDTO";
import { logger } from "../utils/logger";

interface GetJobsByUser extends Request {
  params: {
    email: string;
  };
}

interface GetJobById extends Request {
  params: {
    jobId: string;
  };
}

interface UpdateIssueStatus extends Request {
  params: {
    id: string;
  };
  query: {
    status: string;
  };
}

interface UpdateJobRequest extends Request {
  params: {
    jobId: string;
  };
  body: {
    title?: string;
    description?: string;
    professionalNeeded?: string;
    status?: string;
    timeline?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
  };
  file?: Express.Multer.File;
}

// GET /issue/user/:email route to fetch jobs for a specific user
export const getJobsByUser = async (req: GetJobsByUser, res: Response) => {
  const userEmail = req.params.email;

  try {
    const jobs = await getJobsByUserEmail(userEmail);

    if (!jobs) {
      return res.status(404).json({ message: "No jobs found for the user" });
    }

    // Use DTO to format the jobs before returning the
    const formattedJobs = jobs.map((job) => jobDTO(job));

    res.status(200).json({ jobs: formattedJobs });
  } catch (error: any) {
    console.error(`Error fetching jobs for user ${userEmail}:`, error);
    res
      .status(500)
      .json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// GET /issue/:jobId route to fetch a single job by its ID
export const getJobById = async (req: GetJobById, res: Response) => {
  const jobId = req.params.jobId;

  if (!jobId) {
    return res.status(400).json({ message: "Job ID is required" });
  }

  try {
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    // Use DTO to format the job before returning it
    res.status(200).json(jobDTO(job));
  } catch (error: any) {
    console.error("Error fetching job:", error);
    logger.error("Error fetching job:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch job", error: error.message });
  }
};

// DELETE /issue/:id route to update job status (Reopen job)
export const updateIssueStatus = async (
  req: UpdateIssueStatus,
  res: Response
) => {
  const jobId = req.params.id;
  const status = req.query.status;

  logger.info(`Updating job status with ID: ${jobId} to ${status}`);

  try {
    // Fetch the existing job to clone
    const existingJob = await Job.findById(jobId);

    if (!existingJob) {
      logger.error("Job not found");
      return res.status(404).json({ message: "Job not found" });
    }

    // If the status is "reopen" or similar, create a new job as a clone
    if (status.toLowerCase() === "open") {
      //TODO: enum for job status
      const clonedJobData: Partial<IJob> = {
        title: existingJob.title,
        description: existingJob.description,
        professionalNeeded: existingJob.professionalNeeded,
        userEmail: existingJob.userEmail,
        status: "Open", // New job should be open
        imageUrl: existingJob.imageUrl,
        latitude: existingJob.latitude,
        longitude: existingJob.longitude,
        firstName: existingJob.firstName,
        lastName: existingJob.lastName,
        timeline: existingJob.timeline,
        createdAt: new Date(), // Set new creation timestamp
      };

      // Create the new cloned job
      const clonedJob = await Job.create(clonedJobData);

      logger.info(`Cloned job created with ID: ${clonedJob._id}`);
      await updateJobStatus(jobId, "Reopened");

      res.status(201).json({
        message: "Job cloned and reopened successfully",
        job: jobDTO(clonedJob),
      });
    } else {
      // For other status updates, just update the existing job
      const updatedJob = await updateJobStatus(jobId, status);

      if (!updatedJob) {
        logger.error(
          "updateIssueStatus: Job not found when trying to update status"
        );

        return res.status(404).json({ message: "Job not found" });
      }

      res.status(200).json({
        message: `Job status updated to ${status}`,
        job: jobDTO(updatedJob),
      });
    }
  } catch (error: any) {
    console.error("Error updating job status:", error);
    logger.error("Error updating job status:", error);
    res
      .status(500)
      .json({ message: "Failed to update job status", error: error.message });
  }
};

// PUT /issue/:jobId route to update a single job by its ID
export const updateJob = async (req: UpdateJobRequest, res: Response) => {
  const { jobId } = req.params;
  const {
    title,
    description,
    professionalNeeded,
    status,
    timeline,
    latitude,
    longitude,
  } = req.body;
  let imageUrl = req.file ? req.file.path : req.body.imageUrl; // Use the uploaded image or existing URL

  // logger.info("Updating jobId:", jobId);
  // logger.info("Update data:", obj);

  try {
    const existingJob = await getJobByIdRepo(jobId);

    if (!existingJob) {
      logger.error(`Job not found with jobId: ${jobId}`);
      return res.status(404).json({ message: "Job not found" });
    }

    const updatedJobData: Partial<IJob> = {
      title: title || existingJob.title,
      description: description || existingJob.description,
      professionalNeeded: professionalNeeded || existingJob.professionalNeeded,
      timeline: timeline || existingJob.timeline,
      status: status || existingJob.status,
      ...(imageUrl && { imageUrl }), // Update imageUrl only if it's provided
      latitude: latitude || existingJob.latitude,
      longitude: longitude || existingJob.longitude,
    };

    const updatedJob = await Job.findByIdAndUpdate(jobId, updatedJobData, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      logger.error(`Failed to update job with jobID: ${jobId}`);
      return res.status(500).json({ message: "Failed to update job" });
    }

    // logger.info("Job updated successfully:", updatedJob);
    res.status(200).json(jobDTO(updatedJob));
  } catch (error: any) {
    console.error("Error updating job:", error);
    logger.error("Error updating job:", error);
    return res
      .status(500)
      .json({ message: "Failed to update job", error: error.message });
  }
};
