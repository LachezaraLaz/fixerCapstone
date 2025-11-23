const fixerClientObject = require('../model/professionalClientModel');
const NotFoundError = require("../utils/errors/NotFoundError");
const InternalServerError = require("../utils/errors/InternalServerError");
const {logger} = require("../utils/logger");

/**
 * @module server/controller
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
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
const verifyCredentials = async (req, res, next) => {
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
            throw new NotFoundError('pro credentials', 'Professional not found', 404);
        }

        res.json({ message: 'Trade license submitted successfully', professional });
    } catch (error) {
        logger.error('Error verifying trade license:', error);
        next(new InternalServerError('pro credentials', `Server error: ${error.message}`, 500));
    }
};

module.exports = { verifyCredentials };
