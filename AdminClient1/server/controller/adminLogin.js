const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminModel = require("../model/fixerAdminModel");

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Find admin by email
        const admin = await adminModel.findOne({ email });

        // Check if admin exists
        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Check if admin is verified
        if (!admin.verified) {
            return res.status(401).json({ message: "Please verify your email before signing in." });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { adminId: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Return token and admin status
        res.status(200).json({
            message: "Login successful",
            token,
            isAdmin: admin.role === "admin",
            firstName: admin.firstName,
            lastName: admin.lastName
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { loginAdmin };