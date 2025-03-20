const fixerClientObject = require('../model/professionalClientModel');
const {logger} = require("../utils/logger");
const BadRequestError = require("../utils/errors/BadRequestError");
const InternalServerError = require("../utils/errors/InternalServerError");
const NotFoundError = require("../utils/errors/NotFoundError");

/**
 * @module server/controller
 */

/**
 * Handles the upload of a professional's ID image, updates the user's record with the Cloudinary image URL,
 * and sets the form completion status to true.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {Object} req.file - The file object containing the uploaded file information.
 * @param {string} req.file.path - The Cloudinary URL of the uploaded file.
 * @param {Object} req.user - The user object.
 * @param {string} req.user.id - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const professionalUploadID = async (req, res) => {
    logger.info('Received request for ID upload:', req.body);

    // Check if the file was uploaded successfully to Cloudinary
    if (!req.file || !req.file.path) {
        logger.error('File not uploaded or missing path');
        return next(new BadRequestError('pro ID', 'No file uploaded or file path is missing', 400));
    }

    try {
        // Log the Cloudinary URL of the uploaded image
        const cloudinaryUrl = req.file.path;  // This is the Cloudinary URL
        logger.info('File uploaded to Cloudinary:', cloudinaryUrl);

        // Update the user's record with the Cloudinary image URL and set formComplete to true
        const user = await fixerClientObject.fixerClient.findByIdAndUpdate(
            req.user.id,
            { idImageUrl: cloudinaryUrl, formComplete: true },  // Store Cloudinary URL as idImageUrl in MongoDB
            { new: true }
        );

        if (!user) {
            throw new NotFoundError('pro ID', 'Professional not found', 404);
        }

        res.json({ message: 'ID image uploaded successfully and form is now complete', user });
    } catch (error) {
        logger.error('Error updating user with ID image:', error);
        next(new InternalServerError('pro ID', `Server error: ${error.message}`, 500));
    }
};

module.exports = { professionalUploadID };
