const { Jobs } = require('../model/createIssueModel');
const { fixerClient } = require('../model/fixerClientModel'); // Import the fixerClient model
const { getCoordinatesFromAddress } = require('../services/geoCodingService'); // Import the geocoding function
const { uploadImageToCloudinary } = require('../services/cloudinaryService'); // Import the Cloudinary service

const createIssue = async (req, res) => {
    console.log('Request body:', req.body);

    const { title, description, professionalNeeded, email, status } = req.body;

    // Validate required fields
    if (!title || !description || !professionalNeeded || !email) {
        return res.status(400).json({ message: 'Some fields are missing.' });
    }

    let imageUrl = null;

    // If multer successfully uploaded the image, its Cloudinary URL will be in req.file.path
    if (req.file) {
        imageUrl = req.file.path;  // This is the Cloudinary URL
        console.log('Uploaded image URL:', imageUrl);
    }

    try {
        // Fetch client info from the database to get the address
        const clientInfo = await fixerClient.findOne({ email });
        if (!clientInfo) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Construct the full address from client info
        const address = `${clientInfo.street}, ${clientInfo.postalCode}, ${clientInfo.provinceOrState}, ${clientInfo.country}`;
        console.log('Address to geocode:', address); // Log the address

        // Convert the address to latitude and longitude
        const { latitude, longitude } = await getCoordinatesFromAddress(address);

        // Create a new issue with the geocoded coordinates
        const newIssue = await Jobs.create({
            title,
            description,
            professionalNeeded,
            imageUrl,  // Store the Cloudinary image URL
            userEmail: email,  // Store the user's email in the issue
            status,
            latitude,  // Latitude from geocoding
            longitude  // Longitude from geocoding
        });

        res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ message: 'Failed to create issue', error: error.message });
    }
};

module.exports = { createIssue };
