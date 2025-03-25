import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = "Email is required.";
        if (!formData.password) newErrors.password = "Password is required.";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`/api/admin/signin`, formData);

            const { token, isAdmin, firstName, lastName } = response.data;
            localStorage.setItem("authToken", token);
            localStorage.setItem("isAdmin", isAdmin);
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("lastName", lastName);

            navigate("/admin-dashboard"); // Update the navigation path
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error during sign-in. Please check your credentials.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Poppins', sans-serif" }}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.headerText}>Fixer Admin</h1>
            </header>
        <div style={styles.container}>
            <h1 style={styles.title}>Sign In</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                />
                {errors.email && <p style={styles.error}>{errors.email}</p>}

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                />
                {errors.password && <p style={styles.error}>{errors.password}</p>}

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                </button>
            </form>

            <p style={styles.signUpText}>
                Don't have an account?{" "}
                <span
                    style={styles.link}
                    onClick={() => navigate("/signup")}
                >
                    Sign Up
                </span>
            </p>
        </div>
    </div>
    );
}

// Inline styles
const styles = {
    header: {
        backgroundColor: "#f4f4f4",
        padding: "20px 0px",
        textAlign: "left",
        width: "100%",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
    },
    headerText: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "28px",
        fontWeight: "700",
        margin: 0,
        color: "#333",
        padding: "0 20px",
    },

    container: {
        maxWidth: "400px",
        margin: "120px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        textAlign: "center",
        backgroundColor: "#fff",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: "24px",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
    },
    input: {
        width: "80%",
        padding: "10px",
        margin: "5px 0",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxSizing: "border-box",
    },
    button: {
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "10px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        width: "80%",
    },
    error: {
        color: "red",
        fontSize: "12px",
        marginTop: "-5px",
    },
    signUpText: {
        marginTop: "15px",
        fontSize: "14px",
    },
    link: {
        color: "#007bff",
        cursor: "pointer",
        textDecoration: "underline",
    },
};