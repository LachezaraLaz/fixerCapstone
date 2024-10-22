const { Jobs } = require('../model/createIssueModel');
const { uploadImageToCloudinary } = require('../services/cloudinaryService'); // Import the ClientInfo model

const createIssue = async (req, res) => {
    console.log('Request body:', req.body);

    const { title, description, professionalNeeded, email, image, status} = req.body;

    // Validate required fields
    if (!title || !description || !professionalNeeded) {
        return res.status(400).json({ message: 'Some fields are missing.' });
    }

    let imageUrl = null;

    // If multer successfully uploaded the image, its Cloudinary URL will be in req.file.path
    if (req.file) {
        imageUrl = req.file.path;  // This is the Cloudinary URL
        console.log('Uploaded image URL:', imageUrl);
    }

    // Create a new issue
    try {
        const newIssue = await Jobs.create({
            title,
            description,
            professionalNeeded,
            imageUrl,  // Store the Cloudinary image URL
            userEmail: email,  // Store the user's email in the issue
            status,
        });
        res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create issue', error: error.message });
    }
};

module.exports = { createIssue };
