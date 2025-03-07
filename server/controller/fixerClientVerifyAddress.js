const express = require("express");
const axios = require('axios');

/**
 * @module server/controller/fixerClientVerifyAddress
 */

const app = express();
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_KEY;
let coordinates;

/**
 * Verifies an address using the Google Address Validation API.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.street - The street address to verify.
 * @param {string} req.body.postalCode - The postal code of the address to verify.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the address verification is complete.
 */
const verifyAddress = async (req, res) => {
    const { street, postalCode } = req.body;

    try {
        const response = await axios.post(
            `https://addressvalidation.googleapis.com/v1:validateAddress?key=${GOOGLE_API_KEY}`,
            {
                address: {
                    addressLines: [street],
                    postalCode: postalCode,
                },
            }
        );
        console.log(response.data)

        if (response.data.result.verdict.addressComplete === true) {
            //Get coordinates for the verified address
            const fullAddress = `${street}, ${postalCode}`;
            await getCoordinates(fullAddress);

            res.send({ status: 'success', data: 'Address verified successfully from server',
                isAddressValid: true,
                coordinates: coordinates});
        } else {
            res.send({ status: 'error', data: 'address verification failed from server 1' });
        }
    } catch (err) {
        console.error(err);
        res.send({ status: 'error', data: 'address verification failed from server 2' });
    }
};

/**
 * Fetches the geographical coordinates (latitude and longitude) for a given address using the Google Geocoding API.
 *
 * @param {string} fullAddress - The full address to geocode.
 * @returns {Promise<void>} A promise that resolves when the coordinates have been fetched and stored.
 * @throws Will log an error message if the Geocoding API request fails.
 */
const getCoordinates = async (fullAddress) => {
    try {
        const geoResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_API_KEY}`
        );

        if (geoResponse.data.results.length > 0) {
            const location = geoResponse.data.results[0].geometry.location;
            coordinates = {
                latitude: location.lat,
                longitude: location.lng,
            };
        } else {
            coordinates = null;
        }
    } catch (err) {
        console.error('Geocoding API Error:', err.response?.data || err.message);
        coordinates = null;
    }
};

module.exports = { verifyAddress };
