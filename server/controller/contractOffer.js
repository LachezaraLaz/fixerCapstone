const { ContractOffer } = require('../model/contractOfferModel');
const { Jobs } = require('../model/createIssueModel');

const createContractOffer = async (req, res) => {
    const { issueId, fee } = req.body;
    const professionalId = req.user.id;

    if (!issueId || !fee) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const issue = await Jobs.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found.' });
        }

        const newOffer = await ContractOffer.create({ issueId, professionalId, fee });
        res.status(201).json({ message: 'Contract offer created successfully.', offer: newOffer });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create contract offer.', error: error.message });
    }
};

module.exports = { createContractOffer };
