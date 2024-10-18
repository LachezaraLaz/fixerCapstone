const fixerClientObject = require('../model/professionalClientModel');

// Function to handle credential verification
const verifyCredentials = async (req, res) => {
    try {
        // Extract the tradeLicense from the request body
        const { tradeLicense } = req.body;

        // Update the professional's information with the trade license (without setting formComplete to true)
        const professional = await fixerClientObject.fixerClient.findByIdAndUpdate(
            req.user.id,
            { tradeLicense },  // Only update tradeLicense here
            { new: true }
        );

        if (!professional) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        res.json({ message: 'Trade license submitted successfully', professional });
    } catch (error) {
        console.error('Error verifying trade license:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { verifyCredentials };
