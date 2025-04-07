import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import SignUpPage from "./screens/SignUp/SignUpPage";
import SignInPage from "./screens/SignIn/SignInPage";
import VerificationStatus from "./screens/VerificationStatus";
import VerifyEmailPage from "./screens/VerifyEmailPage";
import AdminDashboard from "./screens/AdminDashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/verification-status" element={<VerificationStatus />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/" element={<Navigate to="/signin" replace />} />
            </Routes>
        </Router>
    );
}

export default App;