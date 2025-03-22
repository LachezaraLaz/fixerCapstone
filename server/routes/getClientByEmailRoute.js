const express = require('express');
const router = express.Router();
const { fixerClient } = require('../model/fixerClientModel');

router.get('/', async (req, res) => {
    const { email } = req.query;

    try {
        const client = await fixerClient.findOne({ email }).select('firstName lastName'); // Only fetch necessary fields

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        res.json({
            firstName: client.firstName,
            lastName: client.lastName
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;