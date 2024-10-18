const multer = require('multer');
const path = require('path');
const fixerClientObject = require('../model/professionalClientModel');

// Set up multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define the directory to store uploaded images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique filename with original extension
    }
});

const upload = multer({ storage: storage }).single('idImage'); // Handle 'idImage' field

// Endpoint to handle image upload
const professionalUploadID = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error uploading file', err });
        }

        // Find the user and associate the uploaded ID image and set formComplete to true
        try {
            const user = await fixerClientObject.fixerClient.findByIdAndUpdate(
                req.user.id,
                { idImage: req.file.filename, formComplete: true }, // Update idImage and set formComplete to true
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'Professional not found' });
            }

            res.json({ message: 'ID image uploaded successfully and form is now complete', user });
        } catch (error) {
            console.error('Error uploading ID image:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
};

module.exports = { professionalUploadID };

