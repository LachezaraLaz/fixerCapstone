import { INotification } from "../model/notification";
import { INotificationHistory } from "../model/notificationHistoryModel";

export const notificationDto = (notification: INotification | INotificationHistory)=>{
    return {
        id: notification._id,
        userId: notification.userId,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
    }
}


