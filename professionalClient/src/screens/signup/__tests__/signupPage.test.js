import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpPage from '../signupPage'; // Adjust the import path as necessary
import { Alert } from 'react-native';

// Mock the Alert.alert function
jest.spyOn(Alert, 'alert');

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