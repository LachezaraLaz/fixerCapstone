const express = require('express');
const router = express.Router();
const { getAddressFromCoords } = require('../utils/geoCoding');

router.get('/address', async (req, res) => {
    const { lat, lng } = req.query;

    try {
        const address = await getAddressFromCoords(lat, lng);
        res.json({ address });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;