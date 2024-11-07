const Notification = require('../model/notificationModel'); // Notification model

// Controller to get all notifications for the authenticated user
const getNotifications = async (req, res) => {
    try {
        // Fetch notifications for the user from the Notification model
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });

        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Controller to mark a notification as read
const markAsRead = async (req, res) => {
    const { id } = req.params; // Assuming notification ID is passed in the route parameter

    try {
        // Update the notification's read status
        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
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
    const { userId, message } = req.body; // Example fields for creating a notification

    try {
        const notification = new Notification({
            userId,
            message,
            read: false,
            createdAt: new Date(),
        });

        await notification.save();

        res.status(201).json({ message: 'Notification created', notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Failed to create notification' });
    }
};

module.exports = { getNotifications, markAsRead, createNotification };
