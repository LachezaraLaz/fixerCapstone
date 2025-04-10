import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpPage from "../SignUpPage";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// code to run only this file through the terminal:
// npm run test ./src/screens/SignUp/__tests__/SignUpPage.test.js
// or
// npm run test-coverage ./src/screens/SignUp/__tests__/SignUpPage.test.js

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
            <SignUpPage />
        </BrowserRouter>
    );

describe("SignUpPage", () => {
    beforeEach(() => {
        mockedNavigate.mockReset();
        localStorage.clear();
        jest.clearAllMocks();
    });

    test("renders correctly", () => {
        renderComponent();
        expect(screen.getByText("Fixer Admin")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Sign Up" })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
    });

    test("shows validation errors on empty form", async () => {
        renderComponent();

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        expect(await screen.findByText("Email is required.")).toBeInTheDocument();
        expect(screen.getByText("First name is required.")).toBeInTheDocument();
        expect(screen.getByText("Last name is required.")).toBeInTheDocument();
        expect(screen.getByText("Password is required.")).toBeInTheDocument();
    });

    test("shows error when passwords do not match", async () => {
        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Doe" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "differentpass" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
    });

    test("submits form and navigates on success", async () => {
        axios.post.mockResolvedValue({ data: {} });
        window.alert = jest.fn();

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "John" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Doe" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Admin account created successfully! Please check your email to verify your account."
            );
            expect(mockedNavigate).toHaveBeenCalledWith(
                "/verify-email?email=test%40example.com"
            );
        });
    });

    test("shows alert on failed request", async () => {
        axios.post.mockRejectedValue({
            response: {
                data: {
                    message: "Email already exists",
                },
            },
        });

        window.alert = jest.fn();

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "taken@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "Jane" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Smith" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Email already exists");
        });
    });

    test("navigates to Sign In page on link click", () => {
        renderComponent();

        fireEvent.click(screen.getByText("Sign In"));

        expect(mockedNavigate).toHaveBeenCalledWith("/signin");
    });

    test("disables button and shows loading state during submission", async () => {
        axios.post.mockResolvedValueOnce({ data: {} });

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "loading@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("First Name"), {
            target: { value: "Load" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
            target: { value: "Test" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        expect(screen.getByText("Signing Up...")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Sign Up")).toBeInTheDocument();
        });
    });
});
