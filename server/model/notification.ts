import mongoose, { Document } from "mongoose";

interface INotification extends Document {
  createdAt?: Date;
  isRead?: boolean;
  message: string;
  userId: mongoose.Schema.Types.ObjectId;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    message: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientInfo", // Matches your fixerClientModel
      required: true,
    },
  },
  {
    collection: "notifications",
  }
);

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export { Notification, INotification };
