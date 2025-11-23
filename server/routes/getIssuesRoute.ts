// routes/issueRoute.js
import express from "express";
const { getAllIssues } = require("../controller/getAllIssues"); // Import the controller
const issueRouter = express.Router();

// Route to fetch all issues
issueRouter.get("/", getAllIssues);

export default issueRouter;
