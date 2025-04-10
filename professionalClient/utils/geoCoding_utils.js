import axios from 'axios';

export const getAddressFromCoords = async (latitude, longitude) => {
    try {
        const res = await axios.get(`https://fixercapstone-production.up.railway.app/api/geocode/address`, {
            params: { lat: latitude, lng: longitude }
        });

        return res.data.address;
    } catch (error) {
        console.warn("Error fetching address:", error);
        return "Address unavailable";
    }
};