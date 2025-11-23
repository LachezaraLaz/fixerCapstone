import axios from "axios";
import { Response } from "express";

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
const getCoordinatesFromAddress = async (address: string) => {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          //address: encodeURIComponent(address),
          address,
          key: GOOGLE_MAPS_KEY,
        },
      }
    );

    const data = response.data as google.maps.MapOptions;

    // Check both the status and if results are returned
    if (response.statusText === "OK" && data.center) {
      return { latitude: data.center.lat, longitude: data.center.lng };
    } else {
      throw new Error("Failed to fetch coordinates");
    }
  } catch (error: any) {
    if (error.response) {
      console.error("Geocoding request failed:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request error:", error.message);
    }
    throw error;
  }
};

export { getCoordinatesFromAddress };
