const axios = require('axios');
require('dotenv').config();

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;


const getCoordinatesFromAddress = async (address) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                //address: encodeURIComponent(address),
                address,
                key: GOOGLE_MAPS_KEY,
            },
        });

        // Check both the status and if results are returned
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            return { latitude: lat, longitude: lng };
        } else {
            throw new Error('Failed to fetch coordinates');
        }
    } catch (error) {
        if (error.response) {
            console.error('Geocoding request failed:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Request error:', error.message);
        }
        throw error;
    }
};

module.exports = { getCoordinatesFromAddress };
