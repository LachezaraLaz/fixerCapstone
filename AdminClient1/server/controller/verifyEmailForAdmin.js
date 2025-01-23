const jwt = require("jsonwebtoken");
const adminModel = require("../model/fixerAdminModel"); // Import the admin model
const dotenv = require("dotenv");

dotenv.config();

// Controller to verify the admin's email
async function verifyAdminEmail(req, res) {
    const { token } = req.query; // Extract token from query parameters

    if (!token) {
        return res.status(400).json({ message: "No verification token provided." });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email; // Extract the email from the token payload

        // Find the admin by email
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Admin account not found." });
        }

        // If the admin is already verified, return a success message
        if (admin.verified) {
            return res.status(200).json({ message: "Email already verified." });
        }

        // If the token doesn't match or has expired, return an error
        if (admin.verificationToken !== token) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        // Mark the admin as verified
        admin.verified = true;
        admin.verificationToken = undefined; // Clear the token after verification
        await admin.save();

        res.status(200).json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Invalid or expired token." });
    }
}

module.exports = { verifyAdminEmail };