import express from "express";

import { addReview } from "../controller/reviewController";

const reviewRouter = express.Router();

// Define the route for adding a review
reviewRouter.post("/add", addReview);

export default reviewRouter;
