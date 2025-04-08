import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInPage from "../SignInPage";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// code to run only this file through the terminal:
// npm run test ./src/screens/SignIn/__tests__/SignInPage.test.js
// or
// npm run test-coverage ./src/screens/SignIn/__tests__/SignInPage.test.js

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockedNavigate,
}));

// Mock axios
jest.mock("axios");

const renderComponent = () =>
    render(
        <BrowserRouter>
            <SignInPage />
        </BrowserRouter>
    );

describe("SignInPage", () => {
    beforeEach(() => {
        localStorage.clear();
        mockedNavigate.mockReset();
    });

    test("renders correctly", () => {
        renderComponent();
    
        expect(screen.getByText("Fixr Admin")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    
        // More specific: find the button by role and name
        expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
        // And if you want to test the heading too:
        expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
    });
    

    test("shows validation errors if fields are empty", async () => {
        renderComponent();
    
        fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    
        expect(await screen.findByText("Email is required.")).toBeInTheDocument();
        expect(screen.getByText("Password is required.")).toBeInTheDocument();
    });
    

    test("updates input fields correctly", () => {
        renderComponent();
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Password");

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });

        expect(emailInput.value).toBe("test@example.com");
        expect(passwordInput.value).toBe("password123");
    });

    test("submits form and navigates on success", async () => {
        axios.post.mockResolvedValue({
            data: {
                token: "fakeToken",
                isAdmin: true,
                firstName: "Test",
                lastName: "User",
            },
        });

        renderComponent();
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "admin@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "adminpass" },
        });
        fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

        await waitFor(() => {
            expect(localStorage.getItem("authToken")).toBe("fakeToken");
            expect(localStorage.getItem("isAdmin")).toBe("true");
            expect(mockedNavigate).toHaveBeenCalledWith("/admin-dashboard");
        });
    });

    test("navigates to Sign Up page on link click", () => {
        renderComponent();
        fireEvent.click(screen.getByText("Sign Up"));
        expect(mockedNavigate).toHaveBeenCalledWith("/signup");
    });

    test("disables button and shows loading text when submitting", async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                token: "token",
                isAdmin: true,
                firstName: "Admin",
                lastName: "User",
            },
        });

        renderComponent();
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "admin@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "pass" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
        expect(screen.getByText("Signing In...")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Sign In")).toBeInTheDocument();
        });
    });
});
