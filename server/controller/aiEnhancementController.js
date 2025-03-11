// controller/aiEnhancementController.js
const { enhanceIssueDescription } = require('../services/aiEnhancementService');

const aiEnhancementController = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ error: 'No description provided.' });
        }

        // Call OpenAI service
        const improvedDescription = await enhanceIssueDescription(description);

        res.status(200).json({ improvedDescription });
    } catch (error) {
        console.error('AI enhancement error:', error);
        res.status(500).json({ error: 'Failed to enhance description.' });
    }
};

module.exports = { aiEnhancementController };
