const { Jobs } = require('../model/createIssueModel');
const { uploadImageToCloudinary } = require('../services/cloudinaryService'); // Import the ClientInfo model

// const multer = require('multer');

// // Configure multer to save images to the server
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + '-' + file.originalname);
//     }
// });

// const upload = multer({ storage: storage });

// POST /issue/create route to handle issue creation

const createIssue = async (req, res) => {
    console.log('Request body:', req.body);

    const { title, description, professionalNeeded, email} = req.body;
    // const imageUrl = req.file ? req.file.path : null;

    // Validate required fields
    if (!title || !description || !professionalNeeded) {
        return res.status(400).json({ message: 'Some fields are missing.' });
    }

    let imageUrl = null;

    // Upload image to Cloudinary if it exists
    if (req.file) {
        try {
            imageUrl = await uploadImageToCloudinary(req.file.path);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to upload image', error: error.message });
        }
    }

    // Create a new issue
    try {
        const newIssue = await Jobs.create({
            title,
            description,
            professionalNeeded,
            imageUrl,  // Store the Cloudinary image URL
            userEmail: email,  // Store the user's email in the issue
        });
        res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create issue', error: error.message });
    }
};

// module.exports = { createIssue, upload };
module.exports = { createIssue };
