// routes/paymentRoute.js
import express from "express";

const { deductCut } = require("../controller/paymentController");
const paymentRouter = express.Router();

paymentRouter.post("/deduct-cut/:jobId?", deductCut);

export default paymentRouter;
