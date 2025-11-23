import express, { Response } from "express";
const { getUserProfile } = require("../controller/userController");

const userRouter = express.Router();

userRouter.get("/user/:email", getUserProfile);
userRouter.get("/test", (_, res: Response) => {
  res.json({ message: "Test route works" });
});

export default userRouter;
