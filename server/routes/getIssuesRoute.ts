// routes/issueRoute.js
import express from "express";

import { getAllIssues } from "../controller/getAllIssues";

const issueRouter = express.Router();

// Route to fetch all issues
issueRouter.get("/", getAllIssues);

export default issueRouter;
