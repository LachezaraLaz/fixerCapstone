const NotificationRepository = require('../repository/notificationRepository');
const NotificationDto = require('../DTO/notificationDto.js');

// Controller to fetch current notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationRepository.getNotificationsByUserId(req.user.id);
        res.json(notifications.map(notification => new NotificationDto(notification)));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Controller to fetch notification history with pagination
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
        res.status(500).json({ message: 'Failed to fetch notifications history' });
    }
};

// Controller to mark a notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await NotificationRepository.markNotificationAsRead(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification: new NotificationDto(notification) });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};

// Controller to create a notification
const createNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const notification = await NotificationRepository.createNotification(userId, message);

        res.status(201).json({ message: 'Notification created', notification: new NotificationDto(notification) });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Failed to create notification' });
    }
};

// Controller to count unread notifications
const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await NotificationRepository.countUnreadNotifications(req.user.id);
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        res.status(500).json({ message: 'Failed to fetch unread notification count' });
    }
};

module.exports = {
    getNotifications,
    getNotificationHistory,
    markAsRead,
    createNotification,
    getUnreadNotificationCount
};