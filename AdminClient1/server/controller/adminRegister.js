const bcrypt = require("bcryptjs");
const adminModel = require("../model/fixerAdminModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Send Verification Email
const sendVerificationEmail = async (admin, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fixit9337@gmail.com',  // Use your email for sending verification
            pass: process.env.PASS_RESET,  // Ensure this environment variable is set
        },
    });

    const verificationUrl = `http://localhost:5173/admin/verify-email?token=${token}`;

    const mailOptions = {
        from: 'fixit9337@gmail.com',
        to: admin.email,
        subject: "Admin Email Verification",
        html: `<p>Welcome, ${admin.firstName}!</p>
               <p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${admin.email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email.");
    }
};

const registerAdmin = async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    try {
        // Validate input
        if (!email || !firstName || !lastName || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate a verification token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Create a new admin
        const newAdmin = await adminModel.create({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            role: "admin", // Set the role
            verificationToken, // Store the token
            verified: false, // Initially set to false
        });

        try {
            await sendVerificationEmail(newAdmin, verificationToken);
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Instead of deleting the admin, send a warning response
            return res.status(500).json({ message: "Admin created, but failed to send email." });
        }

        res.status(201).json({ message: "Admin account created successfully. Check your email!" });
    } catch (error) {
        console.error("Error registering admin:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { registerAdmin };
