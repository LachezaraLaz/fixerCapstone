import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnterPinPage from '../EnterPinPage'; // Update the path accordingly
import ResetPasswordPage from '../ResetPasswordPage'; // Update the path accordingly

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
