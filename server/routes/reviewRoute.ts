import express from "express";
const { addReview } = require("../controller/reviewController"); // Import the addReview controller

const reviewRouter = express.Router();

// Define the route for adding a review
reviewRouter.post("/add", addReview);

export default reviewRouter;
