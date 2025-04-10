// VerificationStatus.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function VerificationStatus() {
    const query = useQuery();
    const message = query.get("msg") || "Verification status unknown.";
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <h2>{message}</h2>
            <button style={styles.button} onClick={() => navigate("/signin")}>
                Go to Sign In
            </button>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "'Poppins', sans-serif",
        padding: "20px",
    },
    button: {
        marginTop: "20px",
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

