import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ResetPasswordPage from '../ResetPasswordPage';
import SignInPage from '../SignInPage';

// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/ResetPasswordPage.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/ResetPasswordPage.test.js

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

jest.mock('axios');

const Stack = createNativeStackNavigator();

const renderWithNavigation = (routeParams) => {
    return render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="ResetPassword" component={ResetPasswordPage} initialParams={routeParams} />
                <Stack.Screen name="SignInPage" component={SignInPage} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

describe('ResetPasswordPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays an error alert when fields are empty', async () => {
        const routeParams = { email: 'test@example.com' };
    
        const { getByTestId } = renderWithNavigation(routeParams);
    
        fireEvent.press(getByTestId('reset-password-button'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'All fields are required');
        });
    });
    
    test('displays an error alert when passwords do not match', async () => {
        const routeParams = { email: 'test@example.com' };
    
        const { getByPlaceholderText, getByTestId } = renderWithNavigation(routeParams);
    
        fireEvent.changeText(getByPlaceholderText('Enter new password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm new password'), 'password456');
        fireEvent.press(getByTestId('reset-password-button'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
        });
    });
    
    // test('displays success alert and navigates to SignInPage when password reset is successful', async () => {
    //     const routeParams = { email: 'test@example.com' };
    
    //     axios.post.mockResolvedValueOnce({ status: 200 });
    
    //     const { getByPlaceholderText, getByTestId } = renderWithNavigation(routeParams);
    
    //     fireEvent.changeText(getByPlaceholderText('Enter new password'), 'password123');
    //     fireEvent.changeText(getByPlaceholderText('Confirm new password'), 'password123');
    //     fireEvent.press(getByTestId('reset-password-button'));
    
    //     await waitFor(() => {
    //         expect(Alert.alert).toHaveBeenCalledWith('Success', 'Password has been reset successfully');
    //     });
    
    //     await waitFor(() => {
    //         expect(getByTestId('back-to-signin-button')).toBeTruthy(); // Verify navigation to SignInPage
    //     });
    // });
    
    test('displays an error alert when reset fails', async () => {
        const routeParams = { email: 'test@example.com' };
    
        axios.post.mockRejectedValueOnce({
            response: { data: { error: 'Failed to reset password' } },
        });
    
        const { getByPlaceholderText, getByTestId } = renderWithNavigation(routeParams);
    
        fireEvent.changeText(getByPlaceholderText('Enter new password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm new password'), 'password123');
        fireEvent.press(getByTestId('reset-password-button'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to reset password');
        });
    });
    
    test('navigates to SignInPage when Back to Sign In is pressed', () => {
        const routeParams = { email: 'test@example.com' };
    
        const { getByTestId } = renderWithNavigation(routeParams);
    
        fireEvent.press(getByTestId('back-to-signin-button'));
    
        waitFor(() => {
            expect(getByTestId('reset-password-button')).not.toBeInTheDocument(); // Confirm ResetPasswordPage is no longer visible
        });
    });    
});
