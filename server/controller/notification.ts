/**
 * @module server/controller
 */

import { Request, Response } from "express";

import { notificationDto } from "../DTO/notificationDto";
import { NotificationRepository } from "../repository/notificationRepository";

interface GetNotificationRequest extends Request {
  user: {
    id: string;
  };
}

interface GetNotificationHistoryRequest extends Request {
  query: {
    page?: string;
    limit?: string;
  };
  user: {
    id: string;
  };
}

interface MarkAsReadRequest extends Request {
  params: {
    id: string;
  };
}

interface CreateNotificationRequest extends Request {
  body: {
    userId: string;
    message: string;
  };
}

interface GetUnreadNotificationCountRequest extends Request {
  user: {
    id: string;
  };
}

/**
 * Retrieves notifications for the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the notifications are fetched and sent in the response.
 */
export const getNotifications = async (
  req: GetNotificationRequest,
  res: Response
) => {
  try {
    const notifications = await NotificationRepository.getNotificationsByUserId(
      req.user.id
    );

    res.json(
      notifications.map((notification) => notificationDto(notification))
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
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
export const getNotificationHistory = async (
  req: GetNotificationHistoryRequest,
  res: Response
) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const notifications =
      await NotificationRepository.getNotificationHistoryByUserId(
        req.user.id,
        skip,
        limit
      );

    if (notifications.length === 0) {
      return res.status(200).json({ message: "No more notifications" });
    }

    res
      .status(200)
      .json(notifications.map((notification) => notificationDto(notification)));
  } catch (error) {
    console.error("Error fetching notifications history:", error);
    res.status(500).json({ message: "Failed to fetch notifications history" });
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
export const markAsRead = async (req: MarkAsReadRequest, res: Response) => {
  try {
    const notification = await NotificationRepository.markNotificationAsRead(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification marked as read",
      notification: notificationDto(notification),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
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
export const createNotification = async (
  req: CreateNotificationRequest,
  res: Response
) => {
  try {
    const { userId, message } = req.body;
    const notification = await NotificationRepository.createNotification(
      userId,
      message
    );

    res.status(201).json({
      message: "Notification created",
      notification: notificationDto(notification),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Failed to create notification" });
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
export const getUnreadNotificationCount = async (
  req: GetUnreadNotificationCountRequest,
  res: Response
) => {
  try {
    const count = await NotificationRepository.countUnreadNotifications(
      req.user.id
    );
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch unread notification count" });
  }
};
