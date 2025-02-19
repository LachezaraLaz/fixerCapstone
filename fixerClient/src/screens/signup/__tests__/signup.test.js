import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpPage from '../signupPage';
import { Alert } from 'react-native';
import axios from 'axios';
import { IPAddress } from '../../../../ipAddress';

// Mock Alert and axios
jest.spyOn(Alert, 'alert');
jest.mock('axios');

// Set up before each test
beforeEach(() => {
    jest.resetAllMocks();
});

// Test suite
describe('SignUpPage Tests', () => {
    test('successfully creates an account', async () => {
        const mockNavigation = { navigate: jest.fn() };
        // The first mockResolvedValueOnce will respond to handleVerifyAddress
        // The second mockResolvedValueOnce will respond to handleSignUp
        axios.post
            .mockResolvedValueOnce({
                data: {
                    isAddressValid: true,
                    coordinates: {
                        latitude: 12.345678,
                        longitude: 98.7654321,
                    },
                },
            })
            .mockResolvedValueOnce({ status: 200 });

        const { getByPlaceholderText, getByText, getByTestId } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        // Fill in all required fields
        fireEvent.changeText(getByPlaceholderText('Email'), 'newuser@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'Jane');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(
            getByPlaceholderText('House number and Street'),
            '123 Test St'
        );
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '12345');
        fireEvent.changeText(getByPlaceholderText('Province or State'), 'TestState');
        fireEvent.changeText(getByPlaceholderText('Country'), 'TestCountry');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(
            getByPlaceholderText('Confirm Password'),
            'password123'
        );

        // Press "Verify Address"
        const verifyAddressButton = getByText('Verify Address');
        fireEvent.press(verifyAddressButton);

        // Wait for the address verification mock to resolve and update state
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        // Press "Sign Up"
        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(2); // verifyAddress + signUp
            expect(Alert.alert).toHaveBeenCalledWith(
                'Account created successfully. An email was sent to verify your email.'
            );
        });
    });

    test('address verification shows success alert if response.status === "success"', async () => {
        const mockNavigation = { navigate: jest.fn() };

        axios.post.mockResolvedValueOnce({
            status: 'success',
            data: {
                isAddressValid: true,
                coordinates: { latitude: 12.34, longitude: 56.78 },
            },
        });

        const { getByPlaceholderText, getByText } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        // Fill address fields
        fireEvent.changeText(getByPlaceholderText('House number and Street'), '123 Maple');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '12345');

        // Press Verify
        fireEvent.press(getByText('Verify Address'));

        await waitFor(() => {
            // Because response.status === 'success'
            expect(Alert.alert).toHaveBeenCalledWith(
                'Address verified successfully from client'
            );
        });
    });

    test('invalid address', async () => {
        const mockNavigation = { navigate: jest.fn() };

        // Mock verifyAddress to return an invalid address
        axios.post.mockResolvedValueOnce({
            data: {
                isAddressValid: false,
                coordinates: null,
            },
        });

        const { getByPlaceholderText, getByText, getByTestId, queryByText } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        fireEvent.changeText(getByPlaceholderText('Email'), 'invalidAddress@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'Invalid');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Address');
        fireEvent.changeText(
            getByPlaceholderText('House number and Street'),
            '999 Wrong Lane'
        );
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '00000');
        fireEvent.changeText(getByPlaceholderText('Province or State'), 'XState');
        fireEvent.changeText(getByPlaceholderText('Country'), 'XCountry');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        fireEvent.press(getByText('Verify Address'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        // Sign-up button should remain disabled since isAddressValid = false
        const signUpButton = getByTestId('sign-up-button');
        expect(signUpButton.props.accessibilityState.disabled).toBe(true);

        // Check that we do NOT see text: "Valid Address entered"
        expect(queryByText('Valid Address entered')).toBeNull();

        // Optionally, try to press sign up anyway
        fireEvent.press(signUpButton);

        // Since it's disabled, handleSignUp should never be called a second time
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    test('displays an alert when fields are empty', async () => {
        // 1) Mock a valid address verification response
        axios.post.mockResolvedValueOnce({
            data: {
                isAddressValid: true,
                coordinates: { latitude: 12.34, longitude: 56.78 },
            },
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<SignUpPage />);

        // 2) Fill just enough fields to pass verifyAddress
        fireEvent.changeText(
            getByPlaceholderText('House number and Street'),
            '123 Maple St'
        );
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '12345');

        // 3) Press "Verify Address" so that isAddressValid = true
        fireEvent.press(getByText('Verify Address'));
        await waitFor(() => {
            // We expect the verify address axios call
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        // 4) Now press "Sign Up" WITHOUT filling email, password, etc.
        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        // 5) Wait for the empty-fields check
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'All fields are required');
        });
    });

    test('displays an alert when passwords do not match', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                isAddressValid: true,
                coordinates: { latitude: 12.34, longitude: 56.78 },
            },
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<SignUpPage />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'invalidAddress@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'Mismatch');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Password');
        fireEvent.changeText(
            getByPlaceholderText('House number and Street'),
            '999 Wrong Lane'
        );
        fireEvent.changeText(getByPlaceholderText('House number and Street'), '999 Test Ave');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '00000');
        fireEvent.changeText(getByPlaceholderText('Province or State'), 'XState');
        fireEvent.changeText(getByPlaceholderText('Country'), 'XCountry');

        fireEvent.press(getByText('Verify Address'));
        await waitFor(() => {
            // verify address done
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        // Now fill mismatched passwords
        fireEvent.changeText(getByPlaceholderText('Password'), '123456');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), '654321');

        const signUpButton = getByTestId('sign-up-button');
        fireEvent.press(signUpButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
        });
    });

    test('displays "User already exists" for 400 error', async () => {

        axios.post.mockResolvedValueOnce({
            data: { isAddressValid: true, coordinates: { latitude: 1, longitude: 2 } },
        });
        axios.post.mockRejectedValueOnce({
            response: { status: 400, data: { message: 'User already exists' } },
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<SignUpPage />);

        fireEvent.changeText(
            getByPlaceholderText('House number and Street'),
            '123 Maple'
        );
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '12345');

        fireEvent.press(getByText('Verify Address'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1); // verify address
        });

        // Fill the rest so it's not empty or mismatched
        fireEvent.changeText(getByPlaceholderText('Email'), 'existing@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'test');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'user');
        fireEvent.changeText(getByPlaceholderText('Province or State'), 'TestState');
        fireEvent.changeText(getByPlaceholderText('Country'), 'TestCountry');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(
            getByPlaceholderText('Confirm Password'),
            'password123'
        );

        fireEvent.press(getByTestId('sign-up-button'));
        await waitFor(() => {
            // now second axios call = registration fails with 400
            expect(axios.post).toHaveBeenCalledTimes(2);
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'User already exists');
        });
    });

    test('navigates to SignInPage when "Sign in" link is pressed', () => {
        const mockNavigation = { navigate: jest.fn() };

        const { getByText } = render(<SignUpPage navigation={mockNavigation} />);

        const signInLink = getByText('Already have an account? Sign in');
        fireEvent.press(signInLink);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignInPage');
    });

    test('displays an unexpected error alert when no request or response exists', async () => {
        const mockNavigation = { navigate: jest.fn() };

        // First mock = successful address verification
        axios.post.mockResolvedValueOnce({
            data: {
                isAddressValid: true,
                coordinates: { latitude: 12.34, longitude: 56.78 },
            },
        });

        // Second mock = throw an error with neither .request nor .response
        axios.post.mockRejectedValueOnce(new Error('Unknown error'));

        const { getByPlaceholderText, getByText, getByTestId } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        fireEvent.changeText(getByPlaceholderText('Email'), 'user1@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'First');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Last');
        fireEvent.changeText(getByPlaceholderText('House number and Street'), '123 A St');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '56789');
        fireEvent.changeText(getByPlaceholderText('Province or State'), 'TestState');
        fireEvent.changeText(getByPlaceholderText('Country'), 'TestCountry');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        fireEvent.press(getByText('Verify Address'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        fireEvent.press(getByTestId('sign-up-button'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(2);
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'An unexpected error occurred');
        });
    });

    test('displays a network error alert when no response is received', async () => {
        const mockNavigation = { navigate: jest.fn() };

        // First mock: success address verification
        axios.post.mockResolvedValueOnce({
            data: {
                isAddressValid: true,
                coordinates: { latitude: 12.34, longitude: 56.78 },
            },
        });

        // Second mock: we have an error with .request but no .response
        axios.post.mockRejectedValueOnce({ request: {} });

        const { getByPlaceholderText, getByText, getByTestId } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        fireEvent.changeText(getByPlaceholderText('Email'), 'user2@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'Hello');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'World');
        fireEvent.changeText(getByPlaceholderText('House number and Street'), '456 B St');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '99999');
        fireEvent.changeText(getByPlaceholderText('Province or State'), 'SomeState');
        fireEvent.changeText(getByPlaceholderText('Country'), 'SomeCountry');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        fireEvent.press(getByText('Verify Address'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        fireEvent.press(getByTestId('sign-up-button'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(2);
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network error');
        });
    });

    test('displays server error when error.response.status is not 400', async () => {
        const mockNavigation = { navigate: jest.fn() };

        // For handleVerifyAddress
        axios.post.mockResolvedValueOnce({
            data: {
                isAddressValid: true,
                coordinates: { latitude: 12.34, longitude: 56.78 },
            },
        });

        // Then for handleSignUp -> 500 error
        axios.post.mockRejectedValueOnce({
            response: { status: 500, data: { message: 'Server meltdown' } },
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('First Name'), 'Test');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'User');
        fireEvent.changeText(getByPlaceholderText('House number and Street'), '123 Street');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '11111');
        fireEvent.changeText(getByPlaceholderText('Province or State'), 'TestProvince');
        fireEvent.changeText(getByPlaceholderText('Country'), 'TestCountry');
        fireEvent.changeText(getByPlaceholderText('Password'), 'pass123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'pass123');

        fireEvent.press(getByText('Verify Address'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        fireEvent.press(getByTestId('sign-up-button'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(2);
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Server meltdown'
            );
        });
    });

    test('shows verify address server error if error.response is present', async () => {
        const mockNavigation = { navigate: jest.fn() };
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'Bad address data' } },
        });

        const { getByPlaceholderText, getByText } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        fireEvent.changeText(getByPlaceholderText('House number and Street'), '000 Broken');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '99999');

        fireEvent.press(getByText('Verify Address'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Bad address data'
            );
        });
    });

    test('shows verify address network error if error.request is present', async () => {
        const mockNavigation = { navigate: jest.fn() };
        axios.post.mockRejectedValueOnce({ request: {} });

        const { getByPlaceholderText, getByText } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        fireEvent.changeText(getByPlaceholderText('House number and Street'), '000 Broken');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '99999');

        fireEvent.press(getByText('Verify Address'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network error Ad.Ver.');
        });
    });

    test('shows verify address unexpected error if neither request nor response exist', async () => {
        const mockNavigation = { navigate: jest.fn() };
        axios.post.mockRejectedValueOnce(new Error('Unknown verify error'));

        const { getByPlaceholderText, getByText } = render(
            <SignUpPage navigation={mockNavigation} />
        );

        fireEvent.changeText(getByPlaceholderText('House number and Street'), '000 Broken');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), '99999');

        fireEvent.press(getByText('Verify Address'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'An unexpected error occurred Ad.Ver.'
            );
        });
    });
});
