
const bcrypt = require("bcrypt");
const adminModel = require("../model/fixerAdminModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();


const sendVerificationEmail = async (admin, token) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your app-specific password
        },
    });

    const verificationUrl = `http://${process.env.HOST}/admin/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
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
            // If email sending fails, clean up the created admin
            await adminModel.findByIdAndDelete(newAdmin._id);
            return res.status(500).json({ message: "Failed to send verification email." });
        }

        res.status(201).json({ message: "Admin account created successfully. Check your email!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};



module.exports = { registerAdmin };
