// routes/notificationRoute.js
const express = require('express');
const { getNotifications, markAsRead, createNotification } = require('../controller/notification');
const { authenticateJWT } = require('../controller/authenticate');

const notificationRouter = express.Router();

// Route to fetch all notifications for a user
notificationRouter.get('/', authenticateJWT, getNotifications);

// Route to mark a notification as read
notificationRouter.patch('/:id/read', authenticateJWT, markAsRead);

// Route to create a new notification (this could be triggered by an event)
notificationRouter.post('/create', authenticateJWT, createNotification);

module.exports = notificationRouter;
