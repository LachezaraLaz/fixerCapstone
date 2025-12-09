import express from "express";

import {
  addCreditCard,
  authenticateJWT,
  getBankingInfoStatus,
  getPaymentMethod,
  profile,
  updateProfessionalProfile,
} from "../controller/professionalClientProfile";
import { registerUser } from "../controller/professionalClientRegister";
import { signinUser } from "../controller/professionalClientSignIn";
import { verifyCredentials } from "../controller/professionalClientVerifyCredentials";
import { professionalUploadID } from "../controller/professionalUploadID";
import {
  resetPassword,
  updatePassword,
  validateCurrentPassword,
} from "../controller/resetController";
import { getReviewsByProfessionalEmail } from "../controller/reviewController";
import { verifyEmail } from "../controller/VerifyEmailForProfessional";
import { upload } from "../services/cloudinaryService";

const professionalRouter = express.Router();

// Register user route
professionalRouter.post("/register", registerUser);
professionalRouter.post("/signin", signinUser);
professionalRouter.get("/profile", authenticateJWT, profile);
professionalRouter.post("/verify", authenticateJWT, verifyCredentials);

// Email verification route
professionalRouter.get("/verify-email", verifyEmail); // New route for email verification

// Password reset routes
professionalRouter.post("/reset/resetPassword", resetPassword); // Route to reset the password

//Current password validation route
professionalRouter.post(
  "/reset/validateCurrentPassword",
  validateCurrentPassword
);

//Profile update route
professionalRouter.put("/updateProfessionalProfile", updateProfessionalProfile);

// update password route
professionalRouter.post("/reset/updatePasswordWithOld", updatePassword);

// Upload middleware before calling the controller
professionalRouter.post(
  "/uploadID",
  authenticateJWT,
  upload("professional_ids").single("idImage"),
  professionalUploadID
);

professionalRouter.get("/:email/reviews", getReviewsByProfessionalEmail);

// professionalRouter.post('/linkSquareAccount', authenticateJWT, linkProfessionalAccount);

professionalRouter.post("/add-banking-info", authenticateJWT, addCreditCard);

professionalRouter.get(
  "/banking-info-status",
  authenticateJWT,
  getBankingInfoStatus
);

professionalRouter.get("/payment-method", authenticateJWT, getPaymentMethod);

export default professionalRouter;
