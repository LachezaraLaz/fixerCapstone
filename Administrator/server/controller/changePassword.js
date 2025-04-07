const bcrypt = require("bcryptjs");
const adminModel = require("../model/fixerAdminModel");
const jwt = require("jsonwebtoken");

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required." });
        }

        // Get adminId from JWT token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        const adminId = decodedToken.adminId;

        // Find admin by ID
        const admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update admin's password
        admin.password = hashedNewPassword;
        await admin.save();

        res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { changePassword };