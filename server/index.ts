import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import chatRouter from "./routes/chatRoute";
import createIssueRouter from "./routes/createIssueRoute";
import emailRouter from "./routes/emailRoute";
import fixerClientRouter from "./routes/fixerClientRoute";
import geocodeRouter from "./routes/geoCodeRoute";
import issueRouter from "./routes/getIssuesRoute";
import getMyProfessionalJobsRouter from "./routes/getMyProfessionalJobsRoute";
import notificationRouter from "./routes/notificationRoute";
import resetPasswordRouter from "./routes/passwordResetRoute";
import paymentRouter from "./routes/paymentRoute";
import professionalRouter from "./routes/professionalClientRoute";
import quoteRouter from "./routes/quoteRoute";
import reviewRouter from "./routes/reviewRoute";
import userRouter from "./routes/userRoute";

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:55000";
const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log("server is running on port", PORT);
});

app.use("/professional", professionalRouter);
app.use("/client", fixerClientRouter);
app.use("/issue", createIssueRouter);
app.use("/issues", issueRouter);
// //app.use('/professional/contractOffer', contractOfferRouter.contractOfferRouter);
app.use("/reset", resetPasswordRouter);
app.use("/quotes", quoteRouter);

// // New route for getting professional's jobs
app.use("/myJobs", getMyProfessionalJobsRouter); // Mount the new route for jobs

// // Email verification route
app.use("/verify-email", professionalRouter);
app.use("/notification", notificationRouter);
app.use("/reviews", reviewRouter);

app.use("/users", userRouter);

app.use("/payment", paymentRouter);

app.use("/send-email-report", emailRouter);

app.use("/chat", chatRouter);

app.use("/api/geocode", geocodeRouter);

export default app;
