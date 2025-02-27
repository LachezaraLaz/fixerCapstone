const express = require('express');
const { linkProfessionalAccount } = require('../controller/paymentController');
const router = express.Router();

// Link a professional’s Square account
router.post('/link', linkProfessionalAccount);

module.exports = router;
