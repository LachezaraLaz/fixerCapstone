import express from "express";

import {
  forgotPassword,
  resetPassword,
  updatePassword,
  validateCurrentPassword,
  validatePin,
} from "../controller/resetController";

const resetPasswordRouter = express.Router();

// Route to request password reset
resetPasswordRouter.post("/requestPasswordReset", forgotPassword);

//resetPasswordRouter.post('/resetPassword', resetPassword);
resetPasswordRouter.post("/validatePin", validatePin);
resetPasswordRouter.post("/updatePassword", resetPassword);
resetPasswordRouter.post("/updatePasswordWithOld", updatePassword);
resetPasswordRouter.post("/validateCurrentPassword", validateCurrentPassword);

export default resetPasswordRouter;
