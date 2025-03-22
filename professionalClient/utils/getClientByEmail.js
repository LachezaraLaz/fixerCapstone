import axios from 'axios';

export const getClientByEmail = async (email) => {
    try {
        const res = await axios.get('https://fixercapstone-production.up.railway.app/api/client', { params: { email } });
        return res.data;
    } catch (error) {
        console.warn("Error fetching client details:", error);
        return null;
    }
};