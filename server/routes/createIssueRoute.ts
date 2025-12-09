import express from "express";

import { createIssue } from "../controller/createIssue";
import {
  getJobsByUser,
  updateIssueStatus,
  updateJob,
  getJobById,
} from "../controller/myIssuesPosted";
import { upload } from "../services/cloudinaryService";
import { aiEnhancementController } from "../controller/aiEnhancementController";

const createIssueRouter = express.Router();

// Route to create an issue
createIssueRouter.post(
  "/create",
  upload("issues").single("image"),
  createIssue
);
// Route to get the client's posted jobs by user email
createIssueRouter.get("/user/:email", getJobsByUser);
// Route to fetch a single job by ID
createIssueRouter.get("/:jobId", getJobById);
// Route to update an issue by ID
createIssueRouter.put("/:jobId", upload("issues").single("image"), updateJob);
// Route to delete a job by ID
createIssueRouter.delete("/updateStatus/:id", updateIssueStatus);
// AI Enhancement route
createIssueRouter.post("/aiEnhancement", aiEnhancementController);

export default createIssueRouter;
