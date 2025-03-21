import axios from 'axios';

export const getClientByEmail = async (email) => {
    try {
        const res = await axios.get('http://192.168.2.16:3000/api/client', { params: { email } });
        return res.data;
    } catch (error) {
        console.warn("Error fetching client details:", error);
        return null;
    }
};