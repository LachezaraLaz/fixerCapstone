// const { Client } = require('square');
// const dotenv = require('dotenv');
//
// // Load environment variables
// dotenv.config();
//
// const client = new Client({
//     accessToken: process.env.SQUARE_ACCESS_TOKEN,
//     environment: process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
// });
//
// module.exports = client;

require('dotenv').config();
const { SquareClient, SquareEnvironment } = require('square');

// Initialize Square client
const squareClient = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: SquareEnvironment.Sandbox
});

module.exports = { squareClient };