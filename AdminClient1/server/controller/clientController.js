const clientModel = require("../model/fixerClientModel");

const getClients = async (req, res) => {
    try {
        // Fetch all clients from the database
        // We're selecting _id, username, and email fields
        const clients = await clientModel.find({}, '_id username email approved');

        // Return the clients data
        res.status(200).json({ clients });
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { getClients };