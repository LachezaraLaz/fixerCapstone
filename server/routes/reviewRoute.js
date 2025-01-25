const express = require('express');
const router = express.Router();
const { addReview } = require('../controller/reviewController'); // Import the addReview controller

// Define the route for adding a review
router.post('/add', addReview);

module.exports = { reviewRouter: router };