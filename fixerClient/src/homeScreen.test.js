import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from './homeScreen';
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

beforeEach(() => {
    jest.clearAllMocks();
});

test('logs out successfully and navigates to welcomePage', async () => {
    const mockNavigation = { replace: jest.fn(), setOptions: jest.fn() };
    const setIsLoggedIn = jest.fn();

    const { getByText } = render(<HomeScreen navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />);

    const logoutButton = getByText('Logout');
    fireEvent.press(logoutButton);

    await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
        expect(Alert.alert).toHaveBeenCalledWith('Logged out', 'You have been logged out successfully');
        expect(setIsLoggedIn).toHaveBeenCalledWith(false);
        expect(mockNavigation.replace).toHaveBeenCalledWith('welcomePage');
    });
});

test('renders "Current Jobs Requested" and "Outstanding Payments" sections', () => {
    const mockNavigation = { setOptions: jest.fn() };
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

    expect(getByText('Current Jobs Requested')).toBeTruthy();
    expect(getByText('Outstanding Payments')).toBeTruthy();
});

