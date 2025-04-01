// routes/chatRoute.js
const express = require('express');
const { initChat } = require('../controller/initChat');
const { fixerClient } = require('../model/fixerClientModel');

const chatRouter = express.Router();

chatRouter.post('/init', async (req, res) => {
    try {
        const { issueTitle, clientEmail, professionalId } = req.body;

        // Fetch clientId from DB using the clientEmail
        const client = await fixerClient.findOne({ email: clientEmail });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const clientId = client._id;

        // Call initChat with the clientId
        await initChat(issueTitle, clientId, professionalId);

        return res.status(200).json({ message: 'Chat channel created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = { chatRouter };
