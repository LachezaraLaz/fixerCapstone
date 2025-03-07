const fixerClientObject = require('../model/professionalClientModel');

/**
 * @module server/controller/professionalClientVerifyCredentials
 */

/**
 * Verifies the professional client's trade license and updates their information.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.tradeLicense - The trade license to be verified.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
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
