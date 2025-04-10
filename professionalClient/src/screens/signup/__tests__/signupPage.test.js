import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpPage from '../signupPage';
import { Alert } from 'react-native';
import axios from 'axios';

// code to run only this file through the terminal:
// npm run test ./src/screens/signup/__tests__/signupPage.test.js
// or
// npm run test-coverage ./src/screens/signup/__tests__/signupPage.test.js

// Mock the Alert.alert function
jest.spyOn(Alert, 'alert');
jest.mock('axios');

beforeEach(() => {
    // Clear all previous mocks
    jest.clearAllMocks();

    // Set up fresh mocks
    axios.post.mockResolvedValue({ status: 200 });
});

// Test suite
describe('SignUpPage Tests', () => {
    test('shows "All fields are required" alert when fields are empty', async () => {
        const { getByTestId, getByText } = render(<SignUpPage />);

        // Find the sign-up button and press it
        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        // Wait for the alert to be called
        await waitFor(() => {
            expect(getByText('Error')).toBeTruthy();
            expect(getByText('All fields are required')).toBeTruthy();

            // expect(Alert.alert).toHaveBeenCalledWith('Error', 'All fields are required');
        });
    });

    test('shows "Passwords do not match" alert when passwords do not match', async () => {
        const { getByPlaceholderText, getByTestId, getByText } = render(<SignUpPage />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        //fireEvent.changeText(getByPlaceholderText('House number and Street'), '1234 Elm Street');
        //fireEvent.changeText(getByPlaceholderText('Postal Code'), '90210');
        //fireEvent.changeText(getByPlaceholderText('Province or State'), 'CA');
        //fireEvent.changeText(getByPlaceholderText('Country'), 'USA');
        fireEvent.changeText(getByPlaceholderText('Password'), '123456');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), '654321');
        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect(getByText('Error')).toBeTruthy();
            expect(getByText('Passwords do not match')).toBeTruthy();
            // expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
        });
    });

    test('successfully creates an account', async () => {
        const mockNavigation = { navigate: jest.fn() };
        const { getByPlaceholderText, getByTestId, getByText } = render(<SignUpPage navigation={mockNavigation} />);

        // Simulate user input
        fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        //fireEvent.changeText(getByPlaceholderText('House number and Street'), '1234 Elm Street');
        //fireEvent.changeText(getByPlaceholderText('Postal Code'), '90210');
        //fireEvent.changeText(getByPlaceholderText('Province or State'), 'CA');
        //fireEvent.changeText(getByPlaceholderText('Country'), 'USA');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password123!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password123!');

        // Simulate button press
        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        // Assertions
        await waitFor(() => {
            expect(getByText("Account created successfully")).toBeTruthy();
            expect(getByText("An email was sent to verify your email.")).toBeTruthy();
            // expect(Alert.alert).toHaveBeenCalledWith("Account created successfully. An email was sent to verify your email.");
        });
    });

    test('displays "Account already exists" alert when email is already in use', async () => {
        const mockNavigation = { navigate: jest.fn() };
        const { getByPlaceholderText, getByTestId, getByText } = render(<SignUpPage navigation={mockNavigation} />);

        // Set up axios to mock a response for an existing email
        axios.post.mockRejectedValueOnce({
            response: {
                status: 400,  // Status code for existing email as per the component
                data: { message: 'Account already exists' }
            }
        });

        // Simulate user input
        fireEvent.changeText(getByPlaceholderText('Email'), 'existing@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'Jane');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password123!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password123!');
        //fireEvent.changeText(getByPlaceholderText('House number and Street'), '4321 Pine Street');
        //fireEvent.changeText(getByPlaceholderText('Postal Code'), '30004');
        //fireEvent.changeText(getByPlaceholderText('Province or State'), 'GA');
        //fireEvent.changeText(getByPlaceholderText('Country'), 'USA');

        // Attempt to sign up
        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        // Assertions
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('https://fixercapstone-production.up.railway.app/professional/register', {
                email: 'existing@example.com',
                firstName: 'Jane',
                lastName: 'Doe',
                password: 'Password123!'
            });
            expect(getByText("Error")).toBeTruthy();
            expect(getByText("An account with this email already exists")).toBeTruthy();
            // expect(Alert.alert).toHaveBeenCalledWith("Error", "Account already exists");
        });
    });

    test('displays a network error alert when no response is received', async () => {
        axios.post.mockRejectedValueOnce({ request: {} });

        const { getByPlaceholderText, getByTestId, getByText } = render(<SignUpPage />);

        // Simulate user input
        fireEvent.changeText(getByPlaceholderText('Email'), 'networkerror@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'Network');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Error');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password123!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password123!');

        // Attempt to sign up
        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        // Assertions
        await waitFor(() => {
            expect(getByText("Error")).toBeTruthy();
            expect(getByText("Network error")).toBeTruthy();
            // expect(Alert.alert).toHaveBeenCalledWith("Error", "Network error");
        });
    });

    test('displays an unexpected error alert when no request or response exists', async () => {
        axios.post.mockRejectedValueOnce({});

        const { getByPlaceholderText, getByTestId, getByText } = render(<SignUpPage />);

        // Simulate user input
        fireEvent.changeText(getByPlaceholderText('Email'), 'unexpectederror@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'Unexpected');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Error');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password123!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password123!');

        // Attempt to sign up
        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        // Assertions
        await waitFor(() => {
            expect(getByText("Error")).toBeTruthy();
            expect(getByText("An unexpected error occurred")).toBeTruthy();
            // expect(Alert.alert).toHaveBeenCalledWith("Error", "An unexpected error occurred");
        });
    });

    test('navigates to SignInPage when the Sign In button is pressed', () => {
        const mockNavigation = { navigate: jest.fn() };
        const { getByText } = render(<SignUpPage navigation={mockNavigation} />);

        const signInButton = getByText('Already have an account? Sign in');
        fireEvent.press(signInButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignInPage'); // Verify navigation to SignInPage
    });
});
