const { enhanceIssueDescription } = require('../services/aiEnhancementService');
const AppError = require('../utils/AppError');

const aiEnhancementController = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || description.trim().length < 10) {
            throw new AppError('Description must be at least 10 characters long.', 400);
        }
        const result = await enhanceIssueDescription(description);
        if (result.error) {
            throw new AppError(result.error, 400);
        }
        res.status(200).json({ improvedDescription: result.improvedDescription });

    } catch (error) {
        console.error('AI enhancement error:', error);
        next(error);
    }
};

module.exports = { aiEnhancementController };
