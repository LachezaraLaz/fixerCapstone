const mongoose = require('mongoose');
const adminModel = require("../model/fixerAdminModel"); // Import the admin model



async function verifyAdminEmailPost(req, res) {
    const { email, code } = req.body; // For POST, expect the token in the body
    if (!email||!code) {
        return res.status(400).json({ message: "Email and verification code are required." });
    }

    try {
        // Find the admin by email
        const admin = await adminModel.findOne({email });
        if (!admin) {
            return res.status(404).json({ message: "Admin account not found." });
        }

        // Check if already verified
        if (admin.verified) {
            return res.status(400).json({ message: "Email already verified." });
        }

        // Validate the verification code
        if (admin.verificationCode !== code) {
            return res.status(400).json({ message: "Invalid verification code." });
        }

        // Check if the code has expired
        if (new Date() > admin.codeExpiresAt) {
            return res.status(400).json({ message: "Verification code expired." });
        }

        // Mark the admin as verified and remove the code fields
        admin.verified = true;
        admin.verificationCode = undefined;
        admin.codeExpiresAt = undefined;
        await admin.save();


        console.log("Admin verification updated successfully:", admin);
        return res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = { verifyAdminEmailPost };

