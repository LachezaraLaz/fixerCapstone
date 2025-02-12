import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../homeScreen';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// code to run only this file through the terminal:
// npm run test ./src/homeScreen.test.js
// or
// npm run test-coverage ./src/homeScreen.test.js

jest.mock('@expo/vector-icons', () => {
    return {
        Ionicons: jest.fn().mockImplementation(() => null), // Mock Ionicons with an empty implementation
    };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    removeItem: jest.fn(() => Promise.resolve()),
}));
jest.spyOn(Alert, 'alert');

describe('HomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    test('logs out successfully', async () => {
        // Create a mock navigation object, with any methods the component uses
        const mockNavigation = {
            setOptions: jest.fn(),
        };

        // We pass in the setIsLoggedIn prop as your component expects
        const setIsLoggedIn = jest.fn();

        // Render the HomeScreen, providing our mock props
        const { getByText } = render(
            <HomeScreen navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />
        );

        // Find the Logout button and press it
        const logoutButton = getByText('Logout');
        fireEvent.press(logoutButton);

        // Wait for the async logout logic to complete
        await waitFor(() => {
            // Check that token removal is called
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('streamToken');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userId');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userName');

            // Check that the user is alerted
            expect(Alert.alert).toHaveBeenCalledWith(
                'Logged out',
                'You have been logged out successfully'
            );

            // Confirm setIsLoggedIn(false) was called
            expect(setIsLoggedIn).toHaveBeenCalledWith(false);
        });
    });

    test('renders "Current Jobs Requested" and "Outstanding Payments" sections', () => {
        const mockNavigation = { setOptions: jest.fn() };
        const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

        expect(getByText('Current Jobs Requested')).toBeTruthy();
        expect(getByText('Outstanding Payments')).toBeTruthy();
    });
});
