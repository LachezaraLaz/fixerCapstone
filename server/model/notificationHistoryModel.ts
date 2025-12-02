import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationHistory extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationHistorySchema = new Schema<INotificationHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "FixerClientInfo",
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "NotificationHistory",
  }
);

export const NotificationHistory: Model<INotificationHistory> =
  mongoose.model<INotificationHistory>(
    "NotificationHistory",
    notificationHistorySchema
  );
