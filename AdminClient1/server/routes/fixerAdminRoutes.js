const express = require("express");
const { registerAdmin } = require("../controller/adminRegister");
const { verifyAdminEmailPost } = require("../controller/adminVerificationController");
const { loginAdmin } = require("../controller/adminLogin");


const adminRouter = express.Router();

// Admin registration route
adminRouter.post("/register", registerAdmin);

// New POST route for email verification
adminRouter.post("/verify-email", verifyAdminEmailPost);

// Admin login route
adminRouter.post("/signin", loginAdmin);

module.exports = { adminRouter };

