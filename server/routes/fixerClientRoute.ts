import express from "express";

import {
  authenticateJWT,
  profile,
  updateProfile,
} from "../controller/fixerClientProfile";
import { registerUser } from "../controller/fixerClientRegister";
import { signinUser } from "../controller/fixerClientSignIn";
import { verifyAddress } from "../controller/fixerClientVerifyAddress";
import { verifyEmail } from "../controller/VerifyEmailForClient";

const fixerClientRouter = express.Router();

// Register user route
fixerClientRouter.post("/register", registerUser);
fixerClientRouter.post("/verifyAddress", verifyAddress);
fixerClientRouter.post("/signin", signinUser);
fixerClientRouter.get("/profile", authenticateJWT, profile);
fixerClientRouter.put("/updateProfile", updateProfile);
// Email verification route
fixerClientRouter.get("/verify-email", verifyEmail); // New route for email verification

export default fixerClientRouter;
