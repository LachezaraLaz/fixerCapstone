const { enhanceIssueDescription } = require('../services/aiEnhancementService');

const aiEnhancementController = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || description.trim().length < 10) {
            return res.status(400).json({ error: "Description must be at least 10 characters long." });
        }
        const result = await enhanceIssueDescription(description);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.status(200).json({ improvedDescription: result.improvedDescription });

    } catch (error) {
        console.error('AI enhancement error:', error);
        res.status(500).json({ error: 'Failed to enhance description.' });
    }
};

module.exports = { aiEnhancementController };
