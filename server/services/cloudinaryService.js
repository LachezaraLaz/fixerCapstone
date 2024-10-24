const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer and Cloudinary storage with a dynamic folder parameter
const storage = (folder) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: folder,  // Use the folder dynamically
        allowed_formats: ['jpg', 'jpeg', 'png', 'heic', 'heif'],
    },
});

// Middleware function to upload images to a specific folder
const upload = (folder) => multer({ storage: storage(folder) });

// Function to upload an image to a specific folder in Cloudinary
const uploadImageToCloudinary = async (path, folder = 'issues') => {
    try {
        const result = await cloudinary.uploader.upload(path, {
            folder: folder,  // Dynamic folder for Cloudinary upload
            format: 'auto',
        });
        return result.secure_url; // Return the URL of the uploaded image
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

module.exports = { upload, uploadImageToCloudinary };

