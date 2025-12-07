import { INotification, Notification } from "../model/notification";
import {
  INotificationHistory,
  NotificationHistory,
} from "../model/notificationHistoryModel";
/**
 * @module server/repository
 */

/**
 * A class representing a repository for notifications.
 * @class NotificationRepository
 */
export class NotificationRepository {
  /**
   * Retrieves notifications for a specific user, sorted by creation date in descending order.
   *
   * @param {string} userId - The ID of the user whose notifications are to be retrieved.
   * @returns {Promise<Array>} A promise that resolves to an array of notifications.
   * @memberof module:server/repository
   */
  static async getNotificationsByUserId(userId: string): Promise<INotification[]> {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Retrieves the notification history for a specific user.
   *
   * @param {string} userId - The ID of the user whose notification history is to be retrieved.
   * @param {number} skip - The number of records to skip for pagination.
   * @param {number} limit - The maximum number of records to return.
   * @returns {Promise<Array>} A promise that resolves to an array of notification history records.
   * @memberof module:server/repository
   */
  static async getNotificationHistoryByUserId(
    userId: string,
    skip: number,
    limit: number
  ): Promise<INotificationHistory[]> {
    return await NotificationHistory.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  /**
   * Marks a notification as read.
   *
   * @param {string} id - The ID of the notification to mark as read.
   * @returns {Promise<Object>} The updated notification object.
   * @memberof module:server/repository
   */
  static async markNotificationAsRead(id: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Creates a new notification for a user.
   *
   * @param {string} userId - The ID of the user to whom the notification belongs.
   * @param {string} message - The message content of the notification.
   * @returns {Promise<Object>} A promise that resolves to the created notification object.
   * @memberof module:server/repository
   */
  static async createNotification(
    userId: string,
    message: string
  ): Promise<INotification> {
    return await Notification.create({
      userId,
      message,
      isRead: false,
      createdAt: new Date(),
    });
  }

  /**
   * Deletes a notification by its ID.
   *
   * @param {string} id - The ID of the notification to delete.
   * @returns {Promise<Object|null>} A promise that resolves to the deleted notification object, or null if no notification was found.
   * @memberof module:server/repository
   */
  static async deleteNotification(id: string): Promise<INotification | null> {
    return await Notification.findByIdAndDelete(id);
  }

  /**
   * Counts the number of unread notifications for a given user.
   *
   * @param {string} userId - The ID of the user whose unread notifications are to be counted.
   * @returns {Promise<number>} A promise that resolves to the number of unread notifications.
   * @memberof module:server/repository
   */
  static async countUnreadNotifications(userId: string): Promise<number> {
    return await Notification.countDocuments({ userId, isRead: false });
  }
}
