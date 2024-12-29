const NotificationHistory = require('../model/notificationHistoryModel');
const Notification = require('../model/notificationModel');

// Existing controller to get current notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Controller to get more notifications from notificationHistory with pagination
const getNotificationHistory = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    try {
        const notifications = await NotificationHistory.find({ userId: req.user.id })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        console.log('Notifications fetched:', notifications); // Debugging log

        if (notifications.length === 0) {
            return res.status(200).json({ message: 'No more notifications' });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications history:', error);
        res.status(500).json({ message: 'Failed to fetch notifications history' });
    }
};


// Existing controller to mark a notification as read
const markAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};

// Optional controller to create a notification if needed
const createNotification = async (req, res) => {
    const { userId, message } = req.body;

    try {
        const notification = new Notification({
            userId,
            message,
            isRead: false,
            createdAt: new Date(),
        });

        await notification.save();

        res.status(201).json({ message: 'Notification created', notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Failed to create notification' });
    }
};

module.exports = { getNotifications, markAsRead, createNotification, getNotificationHistory };
