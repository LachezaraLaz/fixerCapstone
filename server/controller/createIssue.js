const { Jobs } = require('../model/createIssueModel');
const { fixerClient } = require('../model/fixerClientModel'); // Import the fixerClient model
const { getCoordinatesFromAddress } = require('../services/geoCodingService'); // Import the geocoding function

// Function to create a new issue
const createIssue = async (req, res) => {
    console.log('Received request body:', req.body);

    const { title, description, professionalNeeded, email, status = 'open' } = req.body;
    let imageUrl = null;

    // Validate required fields
    if (!title || !description || !professionalNeeded) {
        return res.status(400).json({ message: 'Some required fields are missing.' });
    }

    if (req.file) {
        imageUrl = req.file.path;  // This is the Cloudinary URL from multer
        console.log('Uploaded image URL:', imageUrl);
    }

    try {
        // Fetch client info to obtain address for geolocation
        const clientInfo = await fixerClient.findOne({ email });
        if (!clientInfo) {
            return res.status(404).json({ message: 'Client information not found' });
        }

        const address = `${clientInfo.street}, ${clientInfo.postalCode}, ${clientInfo.provinceOrState}, ${clientInfo.country}`;
        console.log('Address for geocoding:', address);

        const { latitude, longitude } = await getCoordinatesFromAddress(address);

        const newIssue = await Jobs.create({
            title,
            description,
            professionalNeeded,
            imageUrl,
            userEmail: email,
            status,
            latitude,
            longitude
        });

        console.log('Issue created successfully:', newIssue);
        res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
    } catch (error) {
        console.error('Error occurred while creating issue:', error);
        res.status(500).json({ message: 'Failed to create issue', error: error.message });
    }
};

module.exports = { createIssue };
