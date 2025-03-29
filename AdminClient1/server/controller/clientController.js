// Update clientController.js to fetch all users instead
const clientModel = require("../model/fixerClientModel");

const getClients = async (req, res) => {
    try {
        // Fetch all users from the database with all relevant fields
        const users = await clientModel.find({}, '_id firstName lastName email approved accountType');

        // Return the data
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getClients };