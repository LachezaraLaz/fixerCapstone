import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpPage from '../signupPage'; // Adjust the import path as necessary
import { Alert } from 'react-native';
import axios from 'axios';

// Mock the Alert.alert function
jest.spyOn(Alert, 'alert');
jest.mock('axios');

beforeEach(() => {
    // Clear all previous mocks
    jest.clearAllMocks();

    // Set up fresh mocks
    axios.post.mockResolvedValue({ status: 200 });
});

test('shows "All fields are required" alert when fields are empty', async () => {
    const { getByTestId } = render(<SignUpPage />);

    // Find the sign-up button and press it
    const signUpButton = getByTestId('sign-up-button');
    fireEvent.press(signUpButton);

    // Wait for the alert to be called
    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'All fields are required');
    });
});

test('shows "Passwords do not match" alert when passwords do not match', async () => {
    const { getByPlaceholderText, getByTestId } = render(<SignUpPage />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), '123456');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), '654321');
    const signUpButton = getByTestId('sign-up-button');
    fireEvent.press(signUpButton);

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
    });
});

test('successfully creates an account', async () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByPlaceholderText, getByTestId } = render(<SignUpPage navigation={mockNavigation} />);

    // Simulate user input
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

    // Simulate button press
    const signUpButton = getByTestId('sign-up-button');
    fireEvent.press(signUpButton);

    // Assertions
    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Account created successfully");
    });
});
