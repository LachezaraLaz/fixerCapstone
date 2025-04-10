// Update clientController.js to fetch all users instead
const clientModel = require("../model/fixerClientModel");

const getClients = async (req, res) => {
    try {
        // Fetch all users from the database with all relevant fields
        const users = await clientModel.find().select("-password");

        // Return the data
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

// Ban or unban a user
const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { banned } = req.body;

        const user = await clientModel.findByIdAndUpdate(userId, { banned }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: `User has been ${banned ? "banned" : "unbanned"}.`, user });
    } catch (error) {
        console.error("Error updating ban status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};



module.exports = { getClients, banUser };