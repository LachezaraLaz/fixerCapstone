import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import SignUpPage from "./screens/SignUp/SignUpPage";
import SignInPage from "./screens/SignIn/SignInPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/" element={<Navigate to="/signup" replace />} />
            </Routes>
        </Router>
    );
}

export default App;