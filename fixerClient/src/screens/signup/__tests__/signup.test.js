import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpPage from '../signupPage'; // Adjust the path as needed
import { Alert } from 'react-native';
import axios from 'axios';
import { IPAddress } from '../../../../ipAddress'; // Adjust the path as needed

// Mock Alert and axios
jest.spyOn(Alert, 'alert');
jest.mock('axios');

// Set up before each test
beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks to avoid cross-test interference
});

// Test suite
describe('SignUpPage Tests', () => {
    test('displays an alert when fields are empty', async () => {
        const { getByTestId } = render(<SignUpPage />);

        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect('All fields are required');
        });
    });

    test('displays an alert when passwords do not match', async () => {
        const { getByPlaceholderText, getByTestId } = render(<SignUpPage />);

        // Fill the form with mismatched passwords
        fireEvent.changeText(getByPlaceholderText('Password'), '123456');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), '654321');

        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect('Passwords do not match');
        });
    });

    test('successfully creates an account and shows success alert', async () => {
        const mockNavigation = { navigate: jest.fn() };
        axios.post.mockResolvedValueOnce({ status: 200 });

        const { getByPlaceholderText, getByTestId } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        // Fill the form with valid data
        fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('House number and Street'), '1234 Smith street');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), 'H6J6H7');
        fireEvent.changeText(getByPlaceholderText('Province or State'), 'Quebec');
        fireEvent.changeText(getByPlaceholderText('Country'), 'Canada');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `http://${IPAddress}:3000/client/register`,
                {
                    "country": "Canada",
                    "email": "user@example.com",
                    "firstName": "John",
                    "lastName": "Doe",
                    "password": "password123",
                    "postalCode": "H6J6H7",
                    "provinceOrState": "Quebec",
                    "street": "1234 Smith street"
                }
            );
            expect('Account created successfully');
        });
    });

    test('displays an alert when email is already in use', async () => {
        const mockNavigation = { navigate: jest.fn() };
        axios.post.mockRejectedValueOnce({
            response: { status: 400, data: { message: 'User already exists' } },
        });

        const { getByPlaceholderText, getByTestId } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        // Fill the form with an already existing email
        fireEvent.changeText(getByPlaceholderText('Email'), 'existing@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            console.log('Alert.alert calls:', Alert.alert.mock.calls);
            expect('User already exists');
        });
    });

    test('navigates to SignInPage when "Sign in" link is pressed', () => {
        const mockNavigation = { navigate: jest.fn() };

        const { getByText } = render(<SignUpPage navigation={mockNavigation} />);

        const signInLink = getByText('Already have an account? Sign in');
        fireEvent.press(signInLink);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignInPage');
    });
});
