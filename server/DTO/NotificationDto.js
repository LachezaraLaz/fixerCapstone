class NotificationDto {
    constructor(notification) {
        this.id = notification._id;
        this.userId = notification.userId;
        this.message = notification.message;
        this.isRead = notification.isRead;
        this.createdAt = notification.createdAt;
    }
}

module.exports = NotificationDto;
