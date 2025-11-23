import express from "express";

import { sendEmailReport } from "../controller/reportController";

const emailRouter = express.Router();

// POST route to send the email report
emailRouter.post("/", sendEmailReport);

export default emailRouter;
