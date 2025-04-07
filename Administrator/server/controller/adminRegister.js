const bcrypt = require("bcryptjs");
const adminModel = require("../model/fixerAdminModel");
// const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Send Verification Email w/t one time code
const sendVerificationEmail = async (admin, verificationCode) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fixit9337@gmail.com',  // Use your email for sending verification
            pass: process.env.PASS_RESET,  // Ensure this environment variable is set
        },
    });

    // Link to the verification page with the email as a query parameter
    // const verificationUrl = `http://localhost:5173/verify-email?email=${encodeURIComponent(admin.email)}`;

    const mailOptions = {
        from: 'fixit9337@gmail.com',
        to: admin.email,
        subject: "Your Verification Code",
        html: `<p>Welcome, ${admin.firstName}!</p>
           <p>Your verification code is: <strong>${verificationCode}</strong></p>
           <p>This code is valid for 5 minutes.</p>`,
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

        // Generate a 6-digit verification code and expiration timestamp (5 minutes from now)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Create a new admin
        const newAdmin = await adminModel.create({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            role: "admin", // Set the role
            verificationCode, // Store the one-time code
            codeExpiresAt, // Store the expiration time
            verified: false, // Initially set to false
        });

        try {
            await sendVerificationEmail(newAdmin, verificationCode);
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
