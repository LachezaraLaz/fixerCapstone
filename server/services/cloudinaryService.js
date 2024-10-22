const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer and Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'issues',  // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'heic', 'heif'],
    },
});

const upload = multer({ storage: storage });

const uploadImageToCloudinary = async (path) => {
    try {
        const result = await cloudinary.uploader.upload(path, {
            folder: 'issues',
            format: 'auto',
        });
        return result.secure_url; // This is the URL of the uploaded image
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

module.exports = { upload, uploadImageToCloudinary };
