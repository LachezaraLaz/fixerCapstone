import axios from 'axios';

export const getAddressFromCoords = async (latitude, longitude) => {
    try {
        const res = await axios.get(`http://192.168.2.16:3000/api/geocode/address`, {
            params: { lat: latitude, lng: longitude }
        });

        return res.data.address;
    } catch (error) {
        console.warn("Error fetching address:", error);
        return "Address unavailable";
    }
};