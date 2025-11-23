import express from "express";

const { createIssue } = require("../controller/createIssue");
const {
  getJobsByUser,
  updateIssueStatus,
  updateJob,
} = require("../controller/myIssuesPosted");
const { getJobById } = require("../controller/myIssuesPosted");
const { upload } = require("../services/cloudinaryService");
const {
  aiEnhancementController,
} = require("../controller/aiEnhancementController");

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
