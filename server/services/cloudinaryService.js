const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {logger} = require("../utils/logger");
const InternalServerError = require("../utils/errors/InternalServerError");

/**
 * @module server/services
 */

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates a new CloudinaryStorage instance with the specified folder and allowed formats.
 *
 * @param {string} folder - The folder where the files will be stored.
 * @returns {CloudinaryStorage} A new CloudinaryStorage instance configured with the specified folder and allowed formats.
 */
const storage = (folder) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: folder,  // Use the folder dynamically
        allowed_formats: ['jpg', 'jpeg', 'png', 'heic', 'heif'],
    },
});

/**
 * Uploads files to a specified folder using multer.
 *
 * @param {string} folder - The folder where the files will be uploaded.
 * @returns {Function} - A multer middleware configured with the specified storage.
 */
const upload = (folder) => multer({ storage: storage(folder) });

/**
 * Uploads an image to Cloudinary.
 *
 * @param {string} path - The local path to the image file to be uploaded.
 * @param {string} [folder='issues'] - The folder in Cloudinary where the image will be stored.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded image.
 * @throws {Error} - Throws an error if the upload fails.
 */
const uploadImageToCloudinary = async (path, folder = 'issues') => {
    try {
        const result = await cloudinary.uploader.upload(path, {
            folder: folder,  // Dynamic folder for Cloudinary upload
            format: 'auto',
        });
        return result.secure_url; // Return the URL of the uploaded image
    } catch (error) {
        logger.error('Error uploading to Cloudinary:', error);
        throw new InternalServerError('cloudinary service', `Failed to upload image to Cloudinary: ${error.message}`, 500);
    }
};

module.exports = { upload, uploadImageToCloudinary };

