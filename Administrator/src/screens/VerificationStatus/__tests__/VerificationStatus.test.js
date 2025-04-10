import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import VerificationStatus from "../VerificationStatus";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// code to run only this file through the terminal:
// npm run test ./src/screens/VerificationStatus/__tests__/VerificationStatus.test.js
// or
// npm run test-coverage ./src/screens/VerificationStatus/__tests__/VerificationStatus.test.js

// Mocking useNavigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const renderWithRoute = (initialEntries = ["/verify?msg=Email+verified+successfully!"]) => {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/verify" element={<VerificationStatus />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("VerificationStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders custom message from query string", () => {
    renderWithRoute(["/verify?msg=Email+verified+successfully!"]);
    expect(screen.getByText("Email verified successfully!")).toBeInTheDocument();
  });

  test("renders default message when query param is missing", () => {
    renderWithRoute(["/verify"]);
    expect(screen.getByText("Verification status unknown.")).toBeInTheDocument();
  });

  test("navigates to /signin when button is clicked", () => {
    renderWithRoute();
    fireEvent.click(screen.getByRole("button", { name: /go to sign in/i }));
    expect(mockedNavigate).toHaveBeenCalledWith("/signin");
  });
});
