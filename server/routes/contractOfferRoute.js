const express = require('express');
const { createContractOffer } = require('../controller/contractOffer');

const contractOfferRouter = express.Router();

contractOfferRouter.post('/', createContractOffer);

module.exports = { contractOfferRouter };
