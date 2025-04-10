import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import AdminDashboard from "../AdminDashboard";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { act } from "react-dom/test-utils";


// code to run only this file through the terminal:
// npm run test ./src/screens/AdminDashboard/__tests__/AdminDashboard.test.js
// or
// npm run test-coverage ./src/screens/AdminDashboard/__tests__/AdminDashboard.test.js

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

jest.mock("axios");

const renderComponent = async (token = "test-token") => {
    // Set auth token only if token is provided (if null, do not set)
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
    localStorage.setItem("firstName", "Test");
    localStorage.setItem("lastName", "User");
  
    await act(async () => {
      render(
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      );
    });
};
  
  

describe("AdminDashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders header and sidebar", async () => {
    axios.get.mockResolvedValue({ data: { users: [], jobs: [], quotes: [] } });

    renderComponent();

    expect(await screen.findByText("Fixr Admin")).toBeInTheDocument();
    expect(screen.getByText("Welcome, Test!")).toBeInTheDocument();
  });

  test("navigates between tabs", async () => {
    axios.get.mockResolvedValue({ data: { users: [], jobs: [], quotes: [] } });
  
    await renderComponent();
  
    await screen.findByText("Fixr Admin");
  
    fireEvent.click(screen.getByText("Clients"));
    expect(await screen.findByText("Client Management")).toBeInTheDocument();
  
    fireEvent.click(screen.getByText("Professionals"));
    expect(await screen.findByText("Professional Management")).toBeInTheDocument();
  
    fireEvent.click(screen.getByText("Jobs"));
    expect(await screen.findByText("Jobs Management")).toBeInTheDocument();
  
    fireEvent.click(screen.getByText("Quotes"));
    expect(await screen.findByText("Quotes Management")).toBeInTheDocument();
  
    fireEvent.click(screen.getByText("Profile"));
    expect(await screen.findByText("Admin Profile")).toBeInTheDocument();
  });
  

  test("shows password modal and handles cancel", async () => {
    axios.get.mockResolvedValue({ data: { users: [], jobs: [], quotes: [] } });

    renderComponent();

    fireEvent.click(await screen.findByText("Profile"));

    const openModalButton = screen.getByRole("button", { name: "Change Password" });
    fireEvent.click(openModalButton);

    const cancelButton = await screen.findByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    await waitFor(() => {
        // Modal should close — heading should not exist
        expect(screen.queryByRole("heading", { name: "Change Password" })).not.toBeInTheDocument();
    });
  });

  test("logs out properly", async () => {
    axios.get.mockResolvedValue({ data: { users: [], jobs: [], quotes: [] } });
  
    await renderComponent();
  
    await screen.findByText("Fixr Admin");
  
    fireEvent.click(screen.getByText("Logout"));
    expect(mockedNavigate).toHaveBeenCalledWith("/signin");
    expect(localStorage.getItem("authToken")).toBeNull();
  });
  

  test("renders with API data", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/clients") {
        return Promise.resolve({
          data: {
            users: [
              {
                _id: "123abc",
                firstName: "Jane",
                lastName: "Doe",
                email: "jane@example.com",
                accountType: "client",
              },
              {
                _id: "456def",
                firstName: "Bob",
                lastName: "Builder",
                email: "bob@example.com",
                accountType: "professional",
                approved: true,
              },
            ],
          },
        });
      } else if (url === "/api/admin/jobs") {
        return Promise.resolve({ data: { jobs: [] } });
      } else if (url === "/api/admin/quotes") {
        return Promise.resolve({ data: { quotes: [] } });
      }
  
      return Promise.reject(new Error("Unknown URL"));
    });
  
    await renderComponent();
    await screen.findByText("Fixr Admin");
  
    fireEvent.click(screen.getByText("Clients"));
    await screen.findByText("Jane");
  
    fireEvent.click(screen.getByText("Professionals"));
    await screen.findByText("Bob");
  });

  test("handles hover, click, and style changes on Ban/Unban button", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          users: [
            {
              _id: "456def",
              firstName: "Bob",
              lastName: "Builder",
              email: "bob@example.com",
              accountType: "professional",
              approved: true,
              banned: false,
              verified: true,
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { jobs: [] } }) // for fetchJobs
      .mockResolvedValueOnce({ data: { quotes: [] } }); // for fetchQuotes
  
    await renderComponent();
  
    // Wait for tab to be visible and click it
    await waitFor(() => expect(screen.getByText("Professionals")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Professionals"));
  
    // Wait for Bob to show up and click his row
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Bob"));
  
    // Wait for Ban button to appear
    const banButton = await screen.findByRole("button", { name: /ban/i });
    fireEvent.click(banButton);

    // Wait for Close button to appear
    const closeButton = await screen.findByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
  });
  
  test("calls toggleBan and handles success/failure through UI", async () => {
    const user = {
      _id: "456def",
      firstName: "Bob",
      lastName: "Builder",
      email: "bob@example.com",
      accountType: "professional",
      approved: true,
      banned: false,
      verified: true,
    };
  
    // Set up localStorage token
    localStorage.setItem("authToken", "mock-token");
  
    // Mock alert and reload
    window.alert = jest.fn();
    Object.defineProperty(window, "location", {
      value: { reload: jest.fn() },
      writable: true,
    });
  
    // Mock fetch success
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "User banned" }),
      })
    );
  
    // Mock axios.get
    axios.get
      .mockResolvedValueOnce({ data: { users: [user] } }) // /api/admin/clients
      .mockResolvedValueOnce({ data: { jobs: [] } })      // /api/admin/jobs
      .mockResolvedValueOnce({ data: { quotes: [] } });   // /api/admin/quotes
  
    await renderComponent("mock-token");
  
    // Wait for sidebar to render and navigate to Professionals
    await waitFor(() => expect(screen.getByText("Professionals")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Professionals"));
  
    // Wait for Bob to appear
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Bob"));
  
    // Click Ban button in modal
    const banButton = await screen.findByRole("button", { name: /ban/i });
    fireEvent.click(banButton);
  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/admin/clients/ban/${user._id}`,
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: `Bearer mock-token`,
          }),
        })
      );
      expect(window.alert).toHaveBeenCalledWith("User has been banned");
      expect(window.location.reload).toHaveBeenCalled();
    });
  
    // Mock a failure next
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Something went wrong" }),
    });
  
    // Simulate second click for failure case
    fireEvent.click(banButton);
  
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to update ban status: Something went wrong");
    });
  });

  test("shows alert if no auth token is present when banning a user", async () => {
    const user = {
      _id: "456def",
      firstName: "Bob",
      lastName: "Builder",
      email: "bob@example.com",
      accountType: "professional",
      approved: true,
      banned: false,
      verified: true,
    };
  
    // Clear token BEFORE rendering the component
    localStorage.removeItem("authToken");
  
    // Mock alert
    window.alert = jest.fn();
  
    // Mock fetch (should not be called)
    global.fetch = jest.fn();
  
    // Mock axios responses
    axios.get
      .mockResolvedValueOnce({ data: { users: [user] } }) // for fetchClients
      .mockResolvedValueOnce({ data: { jobs: [] } })      // for fetchJobs
      .mockResolvedValueOnce({ data: { quotes: [] } });   // for fetchQuotes
  
    await renderComponent(null);
  
    // Click "Professionals"
    await waitFor(() => expect(screen.getByText("Professionals")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Professionals"));
  
    // Wait for Bob to show and click his row
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Bob"));
  
    // Click "Ban"
    const banButton = await screen.findByRole("button", { name: /ban/i });
    fireEvent.click(banButton);
  
    // Expect alert and no fetch
    expect(window.alert).toHaveBeenCalledWith("You must be logged in to perform this action.");
    expect(fetch).not.toHaveBeenCalled();
  });
  
  test("submits password change form successfully", async () => {
    axios.get.mockResolvedValue({ data: { users: [], jobs: [], quotes: [] } });
  
    const mockPost = jest.fn().mockResolvedValue({
      data: { message: "Password changed successfully!" },
    });
    axios.post = mockPost;
  
    await renderComponent();
  
    // Go to Profile tab
    fireEvent.click(await screen.findByText("Profile"));
  
    // Open modal
    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));
  
    // Fill form
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "oldpass" },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "newpass123" },
    });
  
    // Submit
    const allChangePasswordButtons = screen.getAllByRole("button", { name: "Change Password" });
    const submitButton = allChangePasswordButtons[1]; // second button is the submit
    fireEvent.click(submitButton);
  
    // Expect API to be called with correct payload
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith(
        "http://localhost:5003/admin/change-password",
        {
          currentPassword: "oldpass",
          newPassword: "newpass123",
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer test-token`,
          }),
        })
      )
    );
  
    // Check for success message
    expect(await screen.findByText("Password changed successfully!")).toBeInTheDocument();
  });

  test("filters quotes based on search term and status", async () => {
    const mockQuotes = [
      {
        _id: "q123",
        professionalEmail: "pro@example.com",
        clientEmail: "client@example.com",
        price: 150.5,
        status: "pending",
        jobId: "j789",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "q456",
        professionalEmail: "anotherpro@example.com",
        clientEmail: "anotherclient@example.com",
        price: 250.0,
        status: "accepted",
        jobId: "j999",
        createdAt: new Date().toISOString(),
      },
    ];
  
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/clients") {
        return Promise.resolve({ data: { users: [] } });
      }
      if (url === "/api/admin/jobs") {
        return Promise.resolve({ data: { jobs: [] } });
      }
      if (url === "/api/admin/quotes") {
        return Promise.resolve({ data: { quotes: mockQuotes } });
      }
      return Promise.reject(new Error("Unknown URL: " + url));
    });
  
    await renderComponent();
  
    // Go to Quotes tab
    fireEvent.click(await screen.findByText("Quotes"));
  
    // Wait for first quote
    await screen.findByText("pro@example.com");
  
    // Search for "anotherclient"
    fireEvent.change(screen.getByPlaceholderText("Search quotes..."), {
      target: { value: "anotherclient" },
    });
  
    // Check filtered result
    await screen.findByText("anotherpro@example.com");
    expect(screen.queryByText("pro@example.com")).not.toBeInTheDocument();
  
    // Clear search and filter by status
    fireEvent.change(screen.getByPlaceholderText("Search quotes..."), {
      target: { value: "" },
    });
  
    fireEvent.change(screen.getByDisplayValue("All Quotes"), {
      target: { value: "pending" },
    });
  
    await screen.findByText("pro@example.com");
    expect(screen.queryByText("anotherpro@example.com")).not.toBeInTheDocument();
  });


  test("opens quote details popup when a quote row is clicked", async () => {

    await renderComponent();

    // Navigate to Quotes
    fireEvent.click(await screen.findByText("Quotes"));

    // Click a specific row (pro@example.com)
    const quoteRow = await screen.findByText("pro@example.com");
    fireEvent.click(quoteRow);

    // Wait for the modal to open
    const modalHeading = await screen.findByRole("heading", { name: /quote details/i });

    // Scope queries to modal only
    const modal = modalHeading.closest("div"); // container holding modal content
    const utils = within(modal);

    expect(utils.getByText("pro@example.com")).toBeInTheDocument();
    expect(utils.getByText("client@example.com")).toBeInTheDocument();
    expect(utils.getByText("pending")).toBeInTheDocument();
    expect(utils.getByText("q123")).toBeInTheDocument();
  });

  test("filters jobs based on search term and status", async () => {
    const mockJobs = [
      {
        _id: "job123",
        title: "Fix sink",
        description: "Sink is leaking in the kitchen.",
        professionalNeeded: "Plumber",
        userEmail: "user1@example.com",
        status: "open",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "job456",
        title: "Install light",
        description: "Need to install ceiling light.",
        professionalNeeded: "Electrician",
        userEmail: "user2@example.com",
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    ];
  
    axios.get.mockImplementation((url) => {
        if (url === "/api/admin/clients") {
          return Promise.resolve({ data: { users: [] } });
        }
        if (url === "/api/admin/jobs") {
          return Promise.resolve({ data: { jobs: mockJobs } });
        }
        if (url === "/api/admin/quotes") {
          return Promise.resolve({ data: { quotes: [] } });
        }
        return Promise.reject(new Error("Unknown URL: " + url));
      });
    await renderComponent();
  
    // Go to Jobs tab
    fireEvent.click(await screen.findByText("Jobs"));
  
    // Make sure the "Fix sink" job is visible initially
    await screen.findByText(/Fix sink/i);
  
    // Type "light" in search to filter to second job
    fireEvent.change(screen.getByPlaceholderText("Search jobs..."), {
      target: { value: "light" },
    });
  
    // Should show only "Install light"
    await screen.findByText(/Install light/i);
    expect(screen.queryByText(/Fix sink/i)).not.toBeInTheDocument();
  
    // Clear search
    fireEvent.change(screen.getByPlaceholderText("Search jobs..."), {
      target: { value: "" },
    });
  
    // Select status = "open"
    fireEvent.change(screen.getByDisplayValue("All Jobs"), {
      target: { value: "open" },
    });
  
    // Should show only "Fix sink"
    await screen.findByText(/Fix sink/i);
    expect(screen.queryByText(/Install light/i)).not.toBeInTheDocument();
  });

  test("opens job details popup when a job row is clicked", async () => {
 
    await renderComponent();
  
    // Navigate to Jobs tab
    fireEvent.click(await screen.findByText("Jobs"));
  
    // Click a specific job row
    const jobRow = await screen.findByText("Fix sink");
    fireEvent.click(jobRow);
  
    // Wait for modal to appear
    const modalHeading = await screen.findByRole("heading", { name: /job details/i });
    const modal = modalHeading.closest("div");
    const utils = within(modal);
  
    // Assertions inside modal
    expect(utils.getByText("Fix sink")).toBeInTheDocument();
    expect(utils.getByText("Sink is leaking in the kitchen.")).toBeInTheDocument();
    expect(utils.getByText("Plumber")).toBeInTheDocument();
    expect(utils.getByText("user1@example.com")).toBeInTheDocument();
    expect(utils.getByText("open")).toBeInTheDocument();
    expect(utils.getByText("job123")).toBeInTheDocument();
  });
  
  test("filters clients based on search term and status", async () => {
    const mockUsers = [
      {
        _id: "c123",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        accountType: "client",
      },
      {
        _id: "c456",
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob@example.com",
        accountType: "client",
      },
    ];
  
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/clients") {
        return Promise.resolve({ data: { users: mockUsers } });
      }
      if (url === "/api/admin/jobs") {
        return Promise.resolve({ data: { jobs: [] } });
      }
      if (url === "/api/admin/quotes") {
        return Promise.resolve({ data: { quotes: [] } });
      }
      return Promise.reject(new Error("Unknown URL: " + url));
    });
  
    await renderComponent();
  
    fireEvent.click(await screen.findByText("Clients"));
  
    await screen.findByText("Alice");
  
    fireEvent.change(screen.getByPlaceholderText("Search clients..."), {
      target: { value: "bob" },
    });
  
    await screen.findByText("Bob");
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  test("opens client details popup when a client row is clicked", async () => {
    const mockUsers = [
      {
        _id: "c123",
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        accountType: "client",
      },
    ];
  
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/clients") {
        return Promise.resolve({ data: { users: mockUsers } });
      }
      if (url === "/api/admin/jobs") {
        return Promise.resolve({ data: { jobs: [] } });
      }
      if (url === "/api/admin/quotes") {
        return Promise.resolve({ data: { quotes: [] } });
      }
      return Promise.reject(new Error("Unknown URL: " + url));
    });
  
    await renderComponent();
  
    fireEvent.click(await screen.findByText("Clients"));
  
    const clientRow = await screen.findByText("Alice");
    fireEvent.click(clientRow);
  
    const modalHeading = await screen.findByRole("heading", { name: /client details/i });
    const modal = modalHeading.closest("div");
    const utils = within(modal);
  
    expect(utils.getByText("alice@example.com")).toBeInTheDocument();
    expect(utils.getByText("Alice")).toBeInTheDocument();
    expect(utils.getByText("Smith")).toBeInTheDocument();
  });

  test("filters professionals based on search term", async () => {
    const mockUsers = [
      {
        _id: "p123",
        firstName: "Charlie",
        lastName: "Brown",
        email: "charlie@example.com",
        accountType: "professional",
      },
      {
        _id: "p456",
        firstName: "Dana",
        lastName: "White",
        email: "dana@example.com",
        accountType: "professional",
      },
    ];
  
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/clients") {
        return Promise.resolve({ data: { users: mockUsers } });
      }
      if (url === "/api/admin/jobs") {
        return Promise.resolve({ data: { jobs: [] } });
      }
      if (url === "/api/admin/quotes") {
        return Promise.resolve({ data: { quotes: [] } });
      }
      return Promise.reject(new Error("Unknown URL: " + url));
    });
  
    await renderComponent();
  
    fireEvent.click(await screen.findByText("Professionals"));
  
    await screen.findByText("Charlie");
  
    fireEvent.change(screen.getByPlaceholderText("Search professionals..."), {
      target: { value: "dana" },
    });
  
    await screen.findByText("Dana");
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  test("opens professional details popup when a row is clicked", async () => {
    const mockUsers = [
      {
        _id: "p123",
        firstName: "Charlie",
        lastName: "Brown",
        email: "charlie@example.com",
        accountType: "professional",
      },
    ];
  
    axios.get.mockImplementation((url) => {
      if (url === "/api/admin/clients") {
        return Promise.resolve({ data: { users: mockUsers } });
      }
      if (url === "/api/admin/jobs") {
        return Promise.resolve({ data: { jobs: [] } });
      }
      if (url === "/api/admin/quotes") {
        return Promise.resolve({ data: { quotes: [] } });
      }
      return Promise.reject(new Error("Unknown URL: " + url));
    });
  
    await renderComponent();
  
    fireEvent.click(await screen.findByText("Professionals"));
  
    const row = await screen.findByText("Charlie");
    fireEvent.click(row);
  
    const modalHeading = await screen.findByRole("heading", { name: /professional details/i });
    const modal = modalHeading.closest("div");
    const utils = within(modal);
  
    expect(utils.getByText("charlie@example.com")).toBeInTheDocument();
    expect(utils.getByText("Charlie")).toBeInTheDocument();
    expect(utils.getByText("Brown")).toBeInTheDocument();
  });
});
