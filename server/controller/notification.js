const NotificationRepository = require('../repository/notificationRepository');
const NotificationDto = require('../DTO/notificationDto.js');
const AppError = require('../utils/AppError');

/**
 * @module server/controller
 */

/**
 * Retrieves notifications for the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the notifications are fetched and sent in the response.
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationRepository.getNotificationsByUserId(req.user.id);
        res.json(notifications.map(notification => new NotificationDto(notification)));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        next(new AppError('Failed to fetch notifications', 500));
    }
};

/**
 * Retrieves the notification history for the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {number} [req.query.page=1] - The page number for pagination.
 * @param {number} [req.query.limit=10] - The number of notifications per page.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getNotificationHistory = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    try {
        const notifications = await NotificationRepository.getNotificationHistoryByUserId(req.user.id, skip, parseInt(limit));

        if (notifications.length === 0) {
            return res.status(200).json({ message: 'No more notifications' });
        }

        res.status(200).json(notifications.map(notification => new NotificationDto(notification)));
    } catch (error) {
        console.error('Error fetching notifications history:', error);
        next(new AppError('Failed to fetch notifications history', 500));
    }
};

/**
 * Marks a notification as read.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the notification to mark as read.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
const markAsRead = async (req, res) => {
    try {
        const notification = await NotificationRepository.markNotificationAsRead(req.params.id);

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        res.json({ message: 'Notification marked as read', notification: new NotificationDto(notification) });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        next(new AppError('Failed to mark notification as read', 500));
    }
};

/**
 * Creates a new notification.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.userId - The ID of the user to notify.
 * @param {string} req.body.message - The notification message.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the notification is created.
 */
const createNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const notification = await NotificationRepository.createNotification(userId, message);

        res.status(201).json({ message: 'Notification created', notification: new NotificationDto(notification) });
    } catch (error) {
        console.error('Error creating notification:', error);
        next(new AppError('Failed to create notification', 500));
    }
};

/**
 * Get the count of unread notifications for the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the count is fetched and the response is sent.
 */
const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await NotificationRepository.countUnreadNotifications(req.user.id);
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        next(new AppError('Failed to fetch unread notification count', 500));
    }
};

module.exports = {
    getNotifications,
    getNotificationHistory,
    markAsRead,
    createNotification,
    getUnreadNotificationCount
};