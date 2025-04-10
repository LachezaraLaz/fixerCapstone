import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordPage from '../ForgotPasswordPage';
import EnterPinPage from '../EnterPinPage';
import SignInPage from '../signinPage';

// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/ForgotPasswordPage.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/ForgotPasswordPage.test.js

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

jest.mock('axios');

const Stack = createNativeStackNavigator();

const renderWithNavigation = () => {
    return render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
                <Stack.Screen name="EnterPin" component={EnterPinPage} />
                <Stack.Screen name="SignInPage" component={SignInPage} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

describe('ForgotPasswordPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays an error alert when email is not provided', async () => {
        const { getByText } = renderWithNavigation();

        const button = getByText('Send Reset PIN');
        fireEvent.press(button);

        await waitFor(() => {
            expect(getByText('Error')).toBeTruthy();
            expect(getByText('Email field is required')).toBeTruthy();
        });
        // await waitFor(() => {
        //     expect(Alert.alert).toHaveBeenCalledWith('Error', 'Email field is required');
        // });
    });

    test('displays success alert and shows Enter PIN button when email is valid', async () => {
        axios.post.mockResolvedValueOnce({ status: 200 });

        const { getByPlaceholderText, getByText } = renderWithNavigation();

        fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
        fireEvent.press(getByText('Send Reset PIN'));

        await waitFor(() => {
            expect(getByText('Success')).toBeTruthy();
            expect(getByText('Check your email for a PIN to reset your password')).toBeTruthy();
        });

        // await waitFor(() => {
        //     expect(Alert.alert).toHaveBeenCalledWith('Success', 'Check your email for a PIN to reset your password');
        // });

        expect(getByText('Enter PIN')).toBeTruthy();
    });

    test('displays error alert when email is invalid or request fails', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { error: 'Invalid email address' } },
        });

        const { getByPlaceholderText, getByText } = renderWithNavigation();

        fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid@example.com');
        fireEvent.press(getByText('Send Reset PIN'));

        await waitFor(() => {
            expect(getByText('Error')).toBeTruthy();
            expect(getByText('Failed to send reset PIN')).toBeTruthy();
        });
        // await waitFor(() => {
        //     expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid email address');
        // });
    });

    test('navigates to EnterPinPage when Enter PIN is pressed', async () => {
        axios.post.mockResolvedValueOnce({ status: 200 });
    
        const { getByPlaceholderText, getByText, queryByText } = renderWithNavigation();
    
        fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
        fireEvent.press(getByText('Send Reset PIN'));

        await waitFor(() => {
            expect(getByText('Success')).toBeTruthy();
            expect(getByText('Check your email for a PIN to reset your password')).toBeTruthy();
        });
        // await waitFor(() => {
        //     expect(Alert.alert).toHaveBeenCalledWith('Success', 'Check your email for a PIN to reset your password');
        // });
    
        const enterPinButton = getByText('Enter PIN');
        fireEvent.press(enterPinButton);
    
        await waitFor(() => {
            // Verify that the "Enter PIN" screen is visible
            expect(queryByText('Enter PIN')).toBeTruthy();
            // Verify the previous screen content is no longer visible
            expect(queryByText('Forgot Password')).toBeNull();
        });
    });
});
