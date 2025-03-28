import axios from 'axios';

export const getAddressFromCoords = async (latitude, longitude) => {
    console.log("in getAddressFromCoords. lat: " + latitude + " long: " + longitude);
    try {
        const res = await axios.get(`http://192.168.0.68:3000/api/geocode/address`, {
            params: { lat: latitude, lng: longitude }
        });
    console.log("in getAddressFromCoords. address in response from API is ", res.data.address);
        return res.data.address;
    } catch (error) {
        console.warn("Error fetching address:", error);
        return "Address unavailable";
    }
};