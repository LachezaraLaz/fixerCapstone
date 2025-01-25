const Notification = require('../model/notificationModel');
const { Jobs } = require('../model/createIssueModel');
const { fixerClient } = require('../model/fixerClientModel');
const { getCoordinatesFromAddress } = require('../services/geoCodingService');
const { logger } = require('../utils/logger');


const createIssue = async (req, res) => {
    const { title, description, professionalNeeded, email, status = 'open' } = req.body;
    let imageUrl = null;

    if (!title || !description || !professionalNeeded) {
        return res.status(400).json({ message: 'Some required fields are missing.' });
    }

    if (req.file) {
        imageUrl = req.file.path;
    }

    try {
        const clientInfo = await fixerClient.findOne({ email });
        if (!clientInfo) {
            return res.status(404).json({ message: 'Client information not found' });
        }

        const address = `${clientInfo.street}, ${clientInfo.postalCode}, ${clientInfo.provinceOrState}, ${clientInfo.country}`;
        const { latitude, longitude } = await getCoordinatesFromAddress(address);

        const newIssue = await Jobs.create({
            title,
            description,
            professionalNeeded,
            imageUrl,
            userEmail: email,
            status,
            latitude,
            longitude
        });

        // Create a notification for the issue creator
        const notification = new Notification({
            userId: clientInfo._id,  // Use the client's ID
            message: `Your issue titled "${title}" has been created successfully.`,
            isRead: false
        });
        await notification.save();
        console.log("notification", notification);

        res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
        logger.info('Issue created successfully');
        logger.warn('test pino create issue');
    } catch (error) {
        logger.error('Error occurred while creating issue:', error);
        res.status(500).json({ message: 'Failed to create issue', error: error.message });
    }
};

module.exports = { createIssue };
