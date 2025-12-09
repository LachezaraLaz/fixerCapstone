import express from "express";

import {
  authenticateJWT,
  getMyProfessionalJobs,
} from "../controller/getMyProfessionalJobs";

const getMyProfessionalJobsRouter = express.Router();

// Route to get professional's jobs
getMyProfessionalJobsRouter.get("/get", authenticateJWT, getMyProfessionalJobs);

export default getMyProfessionalJobsRouter;
