const Notification = require('../model/notificationModel');
const { Jobs } = require('../model/createIssueModel');
const { fixerClient } = require('../model/fixerClientModel');
const { getCoordinatesFromAddress } = require('../services/geoCodingService');
const { logger } = require('../utils/logger');

/**
 * @module server/controller
 */

/**
 * Creates a new issue based on the provided request data.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.title - The title of the issue.
 * @param {string} req.body.description - The description of the issue.
 * @param {string} req.body.professionalNeeded - The type of professional needed for the issue.
 * @param {string} req.body.email - The email of the user creating the issue.
 * @param {string} [req.body.status='open'] - The status of the issue (default is 'open').
 * @param {Object} req.file - The file object containing the uploaded image (optional).
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 *
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * 
 * @throws {Error} - Throws an error if the issue creation fails.
 */
const createIssue = async (req, res) => {
    const { title, description, professionalNeeded, email, status = 'open',timeline, address } = req.body;
    let imageUrl = null;

    if (!title || !description || !professionalNeeded) {
        throw new BadRequestError('create issue', 'Some required fields are missing.', 400);
    }

    if (req.file) {
        imageUrl = req.file.path;
    }

    try {
        const clientInfo = await fixerClient.findOne({ email });
        if (!clientInfo) {
            throw new NotFoundError('create issue', 'Client information not found', 404);
        }

        // const address = `${clientInfo.street}, ${clientInfo.postalCode}, ${clientInfo.provinceOrState}, ${clientInfo.country}`;
        const { latitude, longitude } = await getCoordinatesFromAddress(address);

        const newIssue = await Jobs.create({
            title,
            description,
            professionalNeeded,
            imageUrl,
            userEmail: email,
            status,
            latitude,
            longitude,
            firstName: clientInfo.firstName,
            lastName: clientInfo.lastName,
            timeline,
        });

        // Create a notification for the issue creator
        const notification = new Notification({
            userId: clientInfo._id,  // Use the client's ID
            message: `🎉 Congrats! Your issue titled "${title}" has been created successfully.`,
            isRead: false
        });
        await notification.save();

        res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
        logger.info('Issue created successfully');
        logger.warn('test pino create issue');
    } catch (error) {
        logger.error('Error occurred while creating issue:', error);
        next(error);
    }
};

module.exports = { createIssue };
