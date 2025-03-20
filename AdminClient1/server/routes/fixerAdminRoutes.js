const express = require("express");
const { registerAdmin } = require("../controller/adminRegister");
const { verifyAdminEmailPost } = require("../controller/adminVerification");
const { loginAdmin } = require("../controller/adminLogin");
const { changePassword } = require("../controller/changePassword");
const { authMiddleware } = require("../middleware/authMiddleware");


const adminRouter = express.Router();

// Admin registration route
adminRouter.post("/register", registerAdmin);

// New POST route for email verification
adminRouter.post("/verify-email", verifyAdminEmailPost);

// Admin login route
adminRouter.post("/signin", loginAdmin);

// Password change route (protected)
adminRouter.post("/change-password", authMiddleware, changePassword);


module.exports = { adminRouter };

