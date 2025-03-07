const fixerClientObject = require('../model/professionalClientModel');

/**
 * @module server/controller/professionalUploadID
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
    console.log('Received request for ID upload:', req.body);

    // Check if the file was uploaded successfully to Cloudinary
    if (!req.file || !req.file.path) {
        console.error('File not uploaded or missing path');
        return res.status(400).json({ message: 'No file uploaded or file path is missing' });
    }

    try {
        // Log the Cloudinary URL of the uploaded image
        const cloudinaryUrl = req.file.path;  // This is the Cloudinary URL
        console.log('File uploaded to Cloudinary:', cloudinaryUrl);

        // Update the user's record with the Cloudinary image URL and set formComplete to true
        const user = await fixerClientObject.fixerClient.findByIdAndUpdate(
            req.user.id,
            { idImageUrl: cloudinaryUrl, formComplete: true },  // Store Cloudinary URL as idImageUrl in MongoDB
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        res.json({ message: 'ID image uploaded successfully and form is now complete', user });
    } catch (error) {
        console.error('Error updating user with ID image:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { professionalUploadID };
