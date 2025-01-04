// routes/notificationRoute.js
const express = require('express');
const { getNotifications, markAsRead, createNotification, getNotificationHistory } = require('../controller/notification');
const { authenticateJWT } = require('../controller/authenticate');

const notificationRouter = express.Router();

// Route to fetch all notifications for a user (current notifications)
notificationRouter.get('/', authenticateJWT, getNotifications);

// Route to fetch more notifications from notificationHistory (with pagination)
notificationRouter.get('/history', authenticateJWT, getNotificationHistory);  // New route for history

// Route to mark a notification as read
notificationRouter.patch('/:id/read', authenticateJWT, markAsRead);

// Route to create a new notification (this could be triggered by an event)
notificationRouter.post('/send', authenticateJWT, createNotification);

module.exports = notificationRouter;
