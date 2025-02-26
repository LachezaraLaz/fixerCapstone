import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import SignUpPage from "./screens/SignUpPage";
import SignInPage from "./screens/SignInPage";
import VerificationStatus from "./screens/VerificationStatus";
import VerifyEmailPage from "./screens/VerifyEmailPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/verification-status" element={<VerificationStatus />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/" element={<Navigate to="/signup" replace />} />
            </Routes>
        </Router>
    );
}

export default App;