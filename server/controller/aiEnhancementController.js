const { enhanceIssueDescription } = require('../services/aiEnhancementService');
const BadRequestError = require("../utils/errors/BadRequestError");
const {logger} = require("../utils/logger");

const aiEnhancementController = async (req, res, next) => {
    try {
        const { description } = req.body;

        if (!description || description.trim().length < 10) {
            throw new BadRequestError('AI controller', 'Description must be at least 10 characters long.', 400);
        }
        const result = await enhanceIssueDescription(description);
        if (result.error) {
            throw new BadRequestError('AI controller', result.error, 400);
        }
        res.status(200).json({ improvedDescription: result.improvedDescription });

    } catch (error) {
        logger.error('AI enhancement error:', error);
        next(error);
    }
};

module.exports = { aiEnhancementController };
