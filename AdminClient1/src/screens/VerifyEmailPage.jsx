import React, {useEffect, useState} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ email: "", code: "" });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Pre-fill the email field if it's passed as a query parameter
    useEffect(() => {
        const email = searchParams.get("email");
        if (email) {
            setFormData((prevData) => ({ ...prevData, email }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/admin/verify-email", formData);
            setMessage(response.data.message);
            setTimeout(() =>
                navigate("/verification-status?msg=" + encodeURIComponent(response.data.message)), 2000);
        } catch (error) {
            const errMsg = error.response?.data?.message || "Verification failed.";
            setMessage(errMsg);
        }
    };

    return (
        <div style={styles.container}>
            <h1>Email Verification</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                />
                <input
                    type="text"
                    name="code"
                    placeholder="Enter verification code"
                    value={formData.code}
                    onChange={handleChange}
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Verify Email</button>
            </form>
            {message && <p>{message}</p>}
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
};

