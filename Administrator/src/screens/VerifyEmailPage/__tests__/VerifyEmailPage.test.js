import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VerifyEmailPage from "../VerifyEmailPage";
import { MemoryRouter, Route, Routes, BrowserRouter } from "react-router-dom";
import axios from "axios";
import { act } from "react-dom/test-utils";

// code to run only this file through the terminal:
// npm run test ./src/screens/VerifyEmailPage/__tests__/VerifyEmailPage.test.js
// or
// npm run test-coverage ./src/screens/VerifyEmailPage/__tests__/VerifyEmailPage.test.js

jest.mock("axios");

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
  useSearchParams: () => [
    new URLSearchParams("email=test@example.com"),
  ],
}));

const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={["/verify-email?email=test@example.com"]}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("pre-fills email input from query string", () => {
    renderComponent();
    expect(screen.getByPlaceholderText("Enter your email")).toHaveValue("test@example.com");
  });

  test("allows user to change inputs", () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const codeInput = screen.getByPlaceholderText("Enter verification code");

    fireEvent.change(emailInput, { target: { value: "changed@example.com" } });
    fireEvent.change(codeInput, { target: { value: "123456" } });

    expect(emailInput.value).toBe("changed@example.com");
    expect(codeInput.value).toBe("123456");
  });

  test("submits form and navigates on success", async () => {
    jest.useFakeTimers(); // control setTimeout

    axios.post.mockResolvedValue({
      data: { message: "Email verified!" },
    });

    render(
      <BrowserRouter>
        <VerifyEmailPage />
      </BrowserRouter>
    );

    // Fill in the code
    fireEvent.change(screen.getByPlaceholderText("Enter verification code"), {
      target: { value: "654321" },
    });

    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));

    // Expect success message
    await screen.findByText("Email verified!");

    // Fast-forward timer (2s)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Wait for navigation
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/verification-status?msg=" + encodeURIComponent("Email verified!")
      );
    });

    jest.useRealTimers();
  });

//   test("submits form and navigates on success", async () => {
//     axios.post.mockResolvedValueOnce({
//       data: { message: "Email verified!" },
//     });

//     renderComponent();

//     fireEvent.change(screen.getByPlaceholderText("Enter verification code"), {
//       target: { value: "654321" },
//     });

//     fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

//     await waitFor(() => {
//       expect(axios.post).toHaveBeenCalledWith("/api/admin/verify-email", {
//         email: "test@example.com",
//         code: "654321",
//       });
//     });

//     // wait for timeout + navigation
//     await waitFor(() => {
//       expect(mockedNavigate).toHaveBeenCalledWith(
//         "/verification-status?msg=" + encodeURIComponent("Email verified!")
//       );
//     });
//   });

  test("shows error message on failure", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid code." } },
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter verification code"), {
      target: { value: "wrongcode" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

    expect(await screen.findByText("Invalid code.")).toBeInTheDocument();
  });

  test("falls back to generic error if no response message", async () => {
    axios.post.mockRejectedValueOnce({});

    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: "Verify Email" }));

    expect(await screen.findByText("Verification failed.")).toBeInTheDocument();
  });
});
