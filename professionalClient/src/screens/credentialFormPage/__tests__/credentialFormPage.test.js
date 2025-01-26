import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CredentialFormPage from '../credentialFormPage'; // Update with the correct path
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// code to run only this file through the terminal:
// npm run test ./src/screens/credentialFormPage/__tests__/credentialFormPage.test.js
// or
// npm run test-coverage ./src/screens/credentialFormPage/__tests__/credentialFormPage.test.js

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('CredentialFormPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly', () => {
        const { getByPlaceholderText, getByText } = render(<CredentialFormPage />);

        expect(getByText('Enter your Trade License:')).toBeTruthy();
        expect(getByPlaceholderText('Trade License Number')).toBeTruthy();
        expect(getByText('Submit')).toBeTruthy();
    });

    test('updates trade license input value', () => {
        const { getByPlaceholderText } = render(<CredentialFormPage />);

        const input = getByPlaceholderText('Trade License Number');
        fireEvent.changeText(input, '12345678');

        expect(input.props.value).toBe('12345678');
    });

    test('submits form and navigates to UploadID on success', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.post.mockResolvedValueOnce({ status: 200 });

        const { getByPlaceholderText, getByText } = render(<CredentialFormPage />);

        const input = getByPlaceholderText('Trade License Number');
        fireEvent.changeText(input, '12345678');

        const submitButton = getByText('Submit');
        fireEvent.press(submitButton);

        await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
            'https://fixercapstone-production.up.railway.app/professional/verify',
            { tradeLicense: '12345678' },
            {
            headers: { Authorization: 'Bearer mock-token' },
            }
        );
        expect(mockNavigation.navigate).toHaveBeenCalledWith('UploadID');
        });
    });

    test('shows error if no token is found', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce(null); // Simulate no token found
    
        // Mock console.error
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
        const { getByPlaceholderText, getByText } = render(<CredentialFormPage />);
    
        const input = getByPlaceholderText('Trade License Number');
        fireEvent.changeText(input, '12345678');
    
        const submitButton = getByText('Submit');
        fireEvent.press(submitButton);
    
        await waitFor(() => {
            expect(axios.post).not.toHaveBeenCalled(); // Ensure axios.post is not called
            expect(console.error).toHaveBeenCalledWith('No token found'); // Ensure console.error is called with the correct message
        });
    
        // Restore the original console.error
        consoleErrorMock.mockRestore();
    });

    test('logs error if form submission fails', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token'); // Simulate token retrieval
        axios.post.mockRejectedValueOnce(new Error('Network error')); // Simulate API error
    
        // Mock console.error
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
        const { getByPlaceholderText, getByText } = render(<CredentialFormPage />);
    
        // Simulate entering a trade license number
        const input = getByPlaceholderText('Trade License Number');
        fireEvent.changeText(input, '12345678');
    
        // Simulate pressing the submit button
        const submitButton = getByText('Submit');
        fireEvent.press(submitButton);
    
        // Wait for the error log
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith(
                'Error submitting form:',
                expect.any(Error) // Ensure the error object is logged
            );
        });
    
        // Restore the original console.error after the test
        consoleErrorMock.mockRestore();
    });    
});
