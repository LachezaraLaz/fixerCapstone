const express = require("express");
const { registerAdmin } = require("../controller/adminRegister");
const { verifyAdminEmail } = require("../controller/verifyEmailForAdmin");


const adminRouter = express.Router();

// Admin registration route
adminRouter.post("/register", registerAdmin);

// Admin email verification route
adminRouter.get("/verify-email", verifyAdminEmail);

module.exports = adminRouter;
