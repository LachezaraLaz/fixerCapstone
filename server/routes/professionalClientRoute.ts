import express from "express";

const { registerUser } = require("../controller/professionalClientRegister");
const { signinUser } = require("../controller/professionalClientSignIn");
const {
  profile,
  authenticateJWT,
  addBankingInfo,
  getBankingInfoStatus,
  getPaymentMethod,
  updateProfessionalProfile,
} = require("../controller/professionalClientProfile");
const {
  verifyCredentials,
} = require("../controller/professionalClientVerifyCredentials");
const { professionalUploadID } = require("../controller/professionalUploadID");
const { upload } = require("../services/cloudinaryService"); // Import the Cloudinary upload service
const {
  forgotPassword,
  resetPassword,
  validateCurrentPassword,
  updatePassword,
} = require("../controller/resetController");
const { verifyEmail } = require("../controller/VerifyEmailForProfessional");
const {
  getReviewsByProfessionalEmail,
} = require("../controller/reviewController"); // Import review functions
const { linkProfessionalAccount } = require("../controller/paymentController");

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

professionalRouter.post("/add-banking-info", authenticateJWT, addBankingInfo);

professionalRouter.get(
  "/banking-info-status",
  authenticateJWT,
  getBankingInfoStatus
);

professionalRouter.get("/payment-method", authenticateJWT, getPaymentMethod);

export default professionalRouter;
