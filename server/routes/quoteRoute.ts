import express from "express";

import {
  authenticateJWT,
  getQuotesByClientEmail,
  getQuotesByJob,
  submitQuote,
  updateQuoteStatus,
} from "../controller/submitQuote";

const quoteRouter = express.Router();

quoteRouter.post("/create", authenticateJWT, submitQuote);
quoteRouter.get("/job/:jobId", authenticateJWT, getQuotesByJob);
quoteRouter.put("/:quoteId", authenticateJWT, updateQuoteStatus);
quoteRouter.get(
  "/client/:clientEmail",
  authenticateJWT,
  getQuotesByClientEmail
);

export default quoteRouter;
