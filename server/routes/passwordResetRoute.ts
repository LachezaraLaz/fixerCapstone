import express from "express";
const resetPasswordRouter = express.Router();
const {
  forgotPassword,
  resetPassword,
  validatePin,
  updatePassword,
  validateCurrentPassword,
} = require("../controller/resetController");

// Route to request password reset
resetPasswordRouter.post("/requestPasswordReset", forgotPassword);

//resetPasswordRouter.post('/resetPassword', resetPassword);
resetPasswordRouter.post("/validatePin", validatePin);
resetPasswordRouter.post("/updatePassword", resetPassword);
resetPasswordRouter.post("/updatePasswordWithOld", updatePassword);
resetPasswordRouter.post("/validateCurrentPassword", validateCurrentPassword);

export default resetPasswordRouter;
