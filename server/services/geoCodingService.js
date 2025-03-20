const axios = require('axios');
require('dotenv').config();
const {logger} = require("../utils/logger");
const InternalServerError = require("../utils/errors/InternalServerError");
const BadRequestError = require("../utils/errors/BadRequestError");

/**
 * @module server/services
 */

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;

/**
 * Fetches the geographical coordinates (latitude and longitude) for a given address using the Google Maps Geocoding API.
 *
 * @param {string} address - The address to geocode.
 * @returns {Promise<{latitude: number, longitude: number}>} - A promise that resolves to an object containing the latitude and longitude of the address.
 * @throws {Error} - Throws an error if the geocoding request fails or if no results are returned.
 */
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
            throw new BadRequestError('Geocoding service', 'Failed to fetch coordinates. The address may be invalid or not found.', 400);
        }
    } catch (error) {
        if (error.response) {
            logger.error('Geocoding request failed:', error.response.data);
        } else if (error.request) {
            logger.error('No response received:', error.request);
        } else {
            logger.error('Request error:', error.message);
        }
        throw new InternalServerError('Geocoding service', `Error fetching coordinates: ${error.message}`, 500);
    }
};

module.exports = { getCoordinatesFromAddress };
