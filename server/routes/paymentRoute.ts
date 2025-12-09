// routes/paymentRoute.js
import express from "express";

import { deductCut } from "../controller/paymentController";

const paymentRouter = express.Router();

paymentRouter.post("/deduct-cut/:jobId?", deductCut);

export default paymentRouter;
