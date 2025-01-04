const mongoose = require('mongoose');

const notificationHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientInfo', // Ensure this matches your user model
        required: true
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// Explicitly specify collection name
module.exports = mongoose.model('NotificationHistory', notificationHistorySchema, 'notificationHistory');
