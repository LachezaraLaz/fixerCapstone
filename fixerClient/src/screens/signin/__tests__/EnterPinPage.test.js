import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnterPinPage from '../EnterPinPage'; 
import ResetPasswordPage from '../ResetPasswordPage'; 

// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/EnterPinPage.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/EnterPinPage.test.js

// Create a stack navigator for testing
const Stack = createNativeStackNavigator();

// Spy on Alert
jest.spyOn(Alert, 'alert');

beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
});

const renderWithNavigation = (routeParams) => {
    return render(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="EnterPin" component={EnterPinPage} initialParams={routeParams} />
                <Stack.Screen name="ResetPasswordPage" component={ResetPasswordPage} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

describe('signIn Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays an error alert when PIN field is empty', async () => {
        const routeParams = { email: 'test@example.com' };

        const { getByText } = renderWithNavigation(routeParams);

        fireEvent.press(getByText('Validate PIN'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'PIN field is required');
        });
    });

    // test('navigates to ResetPasswordPage when PIN is validated successfully', async () => {
    //     const routeParams = { email: 'test@example.com' };

    //     // Mocking the response for a valid PIN
    //     axios.post = jest.fn().mockResolvedValueOnce({ status: 200 });

    //     const { getByPlaceholderText, getByText, queryByText } = renderWithNavigation(routeParams);

    //     fireEvent.changeText(getByPlaceholderText('Enter your PIN'), 'validPin'); // Simulate valid PIN
    //     fireEvent.press(getByText('Validate PIN'));

    //     // Verify the success alert is displayed
    //     await waitFor(() => {
    //         expect(Alert.alert).toHaveBeenCalledWith('Success', 'PIN validated successfully');
    //     });

    //     // Verify navigation to ResetPasswordPage
    //     await waitFor(() => {
    //         expect(queryByText('Enter your PIN')).toBeNull(); // Ensure the EnterPinPage is no longer visible
    //     });

    //     // Use a more specific selector for ResetPasswordPage content
    //     await waitFor(() => {
    //         expect(queryByText('Reset Password')).toBeTruthy(); // Verify navigation to ResetPasswordPage
    //     });
    // });

    test('displays an error alert when incorrect PIN is entered', async () => {
        const routeParams = { email: 'test@example.com' };

        // Mocking the response for an incorrect PIN
        axios.post = jest.fn().mockRejectedValueOnce({
            response: { data: { error: 'Invalid PIN' } },
        });

        const { getByPlaceholderText, getByText } = renderWithNavigation(routeParams);

        fireEvent.changeText(getByPlaceholderText('Enter your PIN'), 'wrongPin'); // Simulate incorrect PIN
        fireEvent.press(getByText('Validate PIN'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid PIN');
        });
    });

    test('displays an error alert when expired PIN is entered', async () => {
        const routeParams = { email: 'test@example.com' };

        // Mocking the response for an expired PIN
        axios.post = jest.fn().mockRejectedValueOnce({
            response: { data: { error: 'Expired PIN' } },
        });

        const { getByPlaceholderText, getByText } = renderWithNavigation(routeParams);

        fireEvent.changeText(getByPlaceholderText('Enter your PIN'), 'expiredPin'); // Simulate expired PIN
        fireEvent.press(getByText('Validate PIN'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Expired PIN');
        });
    });

    test('displays a generic error alert on unexpected error', async () => {
        const routeParams = { email: 'test@example.com' };

        // Mocking an unexpected error
        axios.post = jest.fn().mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getByText } = renderWithNavigation(routeParams);

        fireEvent.changeText(getByPlaceholderText('Enter your PIN'), 'anyPin'); // Simulate any PIN
        fireEvent.press(getByText('Validate PIN'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'An unexpected error occurred');
        });
    });
});
