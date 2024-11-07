const express = require("express");
const axios = require('axios');

const app = express();
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_KEY;
let coordinates;

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
