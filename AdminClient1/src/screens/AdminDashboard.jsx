import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const firstName = localStorage.getItem("firstName") || "Admin";

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem("authToken");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");

        // Redirect to sign-in
        navigate("/signin");
    };

    return (
        <div style={{ fontFamily: "'Poppins', sans-serif" }}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.headerText}>Fixer Admin</h1>
                <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                >
                    Logout
                </button>
            </header>

            <div style={styles.container}>
                <h1 style={styles.title}>Admin Dashboard</h1>
                <p style={styles.welcomeText}>Welcome, {firstName}!</p>
                <p style={styles.infoText}>
                    Your administrator dashboard is currently under construction.
                    <br />
                    More features will be available soon.
                </p>
            </div>
        </div>
    );
}

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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "28px",
        fontWeight: "700",
        margin: 0,
        color: "#333",
        padding: "0 20px",
    },
    logoutButton: {
        backgroundColor: "#dc3545",
        color: "#fff",
        padding: "8px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginRight: "20px",
        fontWeight: "500",
    },
    container: {
        maxWidth: "800px",
        margin: "120px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        textAlign: "center",
        backgroundColor: "#fff",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: "28px",
        marginBottom: "20px",
        color: "#333",
    },
    welcomeText: {
        fontSize: "20px",
        marginBottom: "20px",
        color: "#007bff",
        fontWeight: "500",
    },
    infoText: {
        fontSize: "16px",
        lineHeight: "1.6",
        color: "#555",
    }
};