const axios = require('axios');
require('dotenv').config();

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;


const getAddressFromCoords = async (latitude, longitude) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${latitude},${longitude}`,
                key: GOOGLE_MAPS_KEY
            }
        });

        if (response.data.status === 'OK') {
            return response.data.results[0].formatted_address;
        } else {
            throw new Error('Unable to fetch address');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = { getAddressFromCoords };