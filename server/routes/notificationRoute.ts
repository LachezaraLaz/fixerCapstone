// routes/notificationRoute.js
import express from "express";

import { authenticateJWT } from "../controller/authenticate";
import {
  createNotification,
  getNotificationHistory,
  getNotifications,
  markAsRead,
} from "../controller/notification";

const notificationRouter = express.Router();

// Route to fetch all notifications for a user (current notifications)
notificationRouter.get("/", authenticateJWT, getNotifications);

// Route to fetch more notifications from notificationHistory (with pagination)
notificationRouter.get("/history", authenticateJWT, getNotificationHistory); // New route for history

// Route to mark a notification as read
notificationRouter.patch("/:id/read", authenticateJWT, markAsRead);

// Route to create a new notification (this could be triggered by an event)
notificationRouter.post("/send", authenticateJWT, createNotification);

export default notificationRouter;
