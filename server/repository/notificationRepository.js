const Notification = require('../model/notificationModel');
const NotificationHistory = require('../model/notificationHistoryModel');

class NotificationRepository {
    async getNotificationsByUserId(userId) {
        return await Notification.find({ userId }).sort({ createdAt: -1 });
    }

    async getNotificationHistoryByUserId(userId, skip, limit) {
        return await NotificationHistory.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
    }

    async markNotificationAsRead(id) {
        return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }

    async createNotification(userId, message) {
        return await Notification.create({
            userId,
            message,
            isRead: false,
            createdAt: new Date(),
        });
    }

    async deleteNotification(id) {
        return await Notification.findByIdAndDelete(id);
    }

    async countUnreadNotifications(userId) {
        return await Notification.countDocuments({ userId, isRead: false });
    }
}

module.exports = new NotificationRepository();

