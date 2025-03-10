import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import axios from 'axios';
import SignUpPage from '../signupPage'; // Adjust the path accordingly
import { getByTestId } from '@testing-library/dom';
// import { getByTestId } from '@testing-library/dom';


// code to run only this file through the terminal:
// npm run test ./src/screens/signup/__tests__/signup.test.js
// or
// npm run test-coverage ./src/screens/signup/__tests__/signup.test.js


jest.mock('axios');
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// Mock navigation object
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
};

jest.spyOn(Alert, 'alert');

describe('SignUpPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<SignUpPage navigation={mockNavigation} />);

        // Check if the title and input fields are rendered
        expect(getByText('Sign Up')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    })
    // test('displays an error if required fields are missing', async () => {
    //     const { getByText } = render(<SignUpPage navigation={mockNavigation} />);
        
    //     fireEvent.press(getByText('Sign Up'));
        
    //     await waitFor(() => {
    //          expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email and matching passwords');
    //    });
    // });

    test('displays an error for invalid email', async () => {
        const { getByPlaceholderText, getByText } = render(<SignUpPage navigation={mockNavigation} />);
        
        fireEvent.changeText(getByPlaceholderText('Email'), 'invalidemail');
        fireEvent.press(getByText('Next'));
        
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email and matching passwords');
        });
    });

    test('validates password input', () => {
        const { getByPlaceholderText, getByText } = render(<SignUpPage navigation={mockNavigation} />);

        const passwordInput = getByPlaceholderText('Password');

        // Test invalid password
        fireEvent.changeText(passwordInput, 'weak');
        expect(getByText('• At least 8 characters')).toBeTruthy();
        expect(getByText('• At least one number')).toBeTruthy();
        expect(getByText('• At least one uppercase letter')).toBeTruthy();
        expect(getByText('✓ At least one lowercase letter')).toBeTruthy();
        expect(getByText('• At least one special character')).toBeTruthy();

        // Test valid password
        fireEvent.changeText(passwordInput, 'StrongPass1!');
        expect(getByText('✓ At least 8 characters')).toBeTruthy();
        expect(getByText('✓ At least one number')).toBeTruthy();
        expect(getByText('✓ At least one uppercase letter')).toBeTruthy();
        expect(getByText('✓ At least one lowercase letter')).toBeTruthy();
        expect(getByText('✓ At least one special character')).toBeTruthy();
    });

    test('displays an error for mismatched passwords', async () => {
        const { getByPlaceholderText, getByText } = render(<SignUpPage navigation={mockNavigation} />);
        
        fireEvent.changeText(getByPlaceholderText('Email'), 'valid@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password2!');
        fireEvent.press(getByText('Next'));
        
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email and matching passwords');
        });
    });

    test('displays error for invalid address', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'Invalid address' } }
        });
        
        const { getByPlaceholderText, getByText } = render(<SignUpPage navigation={mockNavigation} />);
        
        fireEvent.changeText(getByPlaceholderText('Email'), 'valid@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1!');
        fireEvent.press(getByText('Next'));
        fireEvent.changeText(getByPlaceholderText('House Number and Street'), '123 Fake Street');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), 'A1B 2C3');
        fireEvent.press(getByText('Verify Address'));
        
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid address');
        });
    });

    it('handles address verification', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                isAddressValid: true,
                coordinates: { latitude: 43.6532, longitude: -79.3832 },
            },
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<SignUpPage navigation={mockNavigation} />);

        // Enter valid email and password
        fireEvent.changeText(getByPlaceholderText('Email'), 'valid@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'StrongPass1!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'StrongPass1!');
        fireEvent.press(getByText('Next'));

        // Enter address details
        fireEvent.changeText(getByPlaceholderText('House Number and Street'), '123 Main St');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), 'A1B 2C3');
        fireEvent.press(getByText('Verify Address'));

        // Wait for address verification to complete
        await waitFor(() => {
            expect(getByText('Valid Address entered')).toBeTruthy();
        });

        // Click Sign Up button
        fireEvent.press(getByTestId('sign-up-button'));

        // Wait for sign up to complete
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/client/verifyAddress',
                {
                    postalCode: 'A1B 2C3',
                    street: '123 Main St',
                }
            );
        });
    });
});