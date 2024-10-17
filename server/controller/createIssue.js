const { Issue } = require('../model/createIssueModel');
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

    const { title, description, professionalNeeded, userID } = req.body;
    // const imageUrl = req.file ? req.file.path : null;

    // Validate required fields
    if (!title || !description || !professionalNeeded) {
        return res.status(400).json({ message: 'Some fields are missing.' });
    }

    // Create a new issue
    try {
        const newIssue = await Issue.create({
            title,
            description,
            professionalNeeded,
            imageUrl: null,
            userID: userID
        });
        res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create issue', error: error.message });
    }
};

// module.exports = { createIssue, upload };
module.exports = { createIssue };
