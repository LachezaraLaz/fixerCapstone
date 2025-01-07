import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HomeScreen from './homeScreen';
import axios from 'axios';
import * as Location from 'expo-location';
import { Alert } from 'react-native';  // Import the Alert module

// Mock expo-modules-core to avoid the NativeModule error
jest.mock('expo-modules-core', () => ({
    NativeModule: {},
}));

// Mock expo-location to simulate its methods
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    watchPositionAsync: jest.fn(),
}));

// Mock expo-constants to avoid errors in test environment
jest.mock('expo-constants', () => ({
    manifest: {},
    platform: {
        ios: true,
        android: false,
    },
    deviceYearClass: 2020,
    isDevice: true,
}));

jest.mock('axios');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('react-native-maps', () => {
    const { View } = require('react-native');
    const MockMapView = (props) => <View>{props.children}</View>;
    const MockMarker = (props) => <View>{props.children}</View>;
    return {
        __esModule: true,
        default: MockMapView,
        Marker: MockMarker,
    };
});

describe('HomeScreen', () => {
    const navigation = { navigate: jest.fn(), replace: jest.fn() };
    const setIsLoggedIn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the loading indicator initially', async () => {
        // Mocking permission request
        require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
            status: 'granted',  // Simulate permission granted
        });

        // Mocking geolocation to return specific coordinates
        require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
            coords: { latitude: 37.78825, longitude: -122.4324 },
        });

        // Mock axios call for issues (even if not necessary, to avoid errors in the component)
        axios.get.mockResolvedValueOnce({
            data: { jobs: [] }  // Mock empty issues
        });

        // Render the component
        const { queryByTestId } = render(
            <HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />
        );

        // Use waitFor to ensure that async operations complete before checking for loading indicator
        await waitFor(() => {
            expect(queryByTestId('loading-indicator')).toBeNull();
        });
    });

    // it('should fetch issues and display markers on the map', async () => {
    //     // Mocking permission request
    //     require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
    //         status: 'granted',  // Simulate permission granted
    //     });

    //     // Mocking geolocation to return specific coordinates
    //     require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
    //         coords: { latitude: 37.78825, longitude: -122.4324 },
    //     });

    //     const mockIssues = {
    //         data: {
    //             jobs: [
    //                 { id: 1, title: 'Leaky Faucet', description: 'Fix this faucet', latitude: 37.78825, longitude: -122.4324, professionalNeeded: 'plumber' },
    //                 { id: 2, title: 'Light Bulb Replacement', description: 'Replace the bulb', latitude: 37.78925, longitude: -122.4324, professionalNeeded: 'electrician' }
    //             ]
    //         }
    //     };

    //     axios.get.mockResolvedValueOnce(mockIssues);

    //     const { getByText, queryByTestId } = render(<HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />);

    //     // Ensure loading indicator is removed after fetching
    //     await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

    //     // Verify issue titles are rendered
    //     expect(getByText('Leaky Faucet')).toBeTruthy();
    //     expect(getByText('Light Bulb Replacement')).toBeTruthy();
    // });

    it('should display an alert if fetching issues fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        const alertSpy = jest.spyOn(Alert, 'alert');
        const { queryByTestId } = render(<HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />);

        // Ensure loading indicator is removed
        await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

        // Verify error alert
        expect(alertSpy).toHaveBeenCalledWith('Error', 'An error occurred while fetching issues.');
    });

    it('should log out the user when the logout button is pressed', async () => {
        // Mocking console.log to suppress logs during the test
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        // Mocking permission request
        require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
            status: 'granted',  // Simulate permission granted
        });

        // Mocking geolocation to return specific coordinates
        require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
            coords: { latitude: 37.78825, longitude: -122.4324 },
        });

        // Mock axios call for issues (even if not necessary, to avoid errors in the component)
        axios.get.mockResolvedValueOnce({
            data: { jobs: [] }  // Mock empty issues
        });

        const setIsLoggedIn = jest.fn();  // Mocking the logout function

        const { getByText, queryByText } = render(<HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />);

        // Wait for the ActivityIndicator to disappear and the logout button to appear
        await waitFor(() => expect(queryByText('Logout')).not.toBeNull());

        // Now that the "Logout" button is rendered, simulate the logout button press
        const logoutButton = getByText('Logout');

        // Wrapping the button press event in act() to avoid state update warnings
        await act(async () => {
            fireEvent.press(logoutButton);
        });

        // Verify if logout function was called and the user is logged out
        await waitFor(() => expect(setIsLoggedIn).toHaveBeenCalledWith(false));

        // Restore the original console.log after the test
        logSpy.mockRestore();
    });


    // it('should handle issue clicks and display alert', async () => {
    //     // Mocking permission request
    //     require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
    //         status: 'granted',  // Simulate permission granted
    //     });

    //     // Mocking geolocation to return specific coordinates
    //     require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
    //         coords: { latitude: 37.78825, longitude: -122.4324 },
    //     });

    //     const mockIssues = {
    //         data: {
    //             jobs: [
    //                 { id: 1, title: 'Leaky Faucet', description: 'Fix this faucet', latitude: 37.78825, longitude: -122.4324, professionalNeeded: 'plumber' },
    //                 { id: 2, title: 'Light Bulb Replacement', description: 'Replace the bulb', latitude: 37.78925, longitude: -122.4324, professionalNeeded: 'electrician' }
    //             ]
    //         }
    //     };

    //     axios.get.mockResolvedValueOnce(mockIssues);

    //     const { getByText, queryByTestId } = render(<HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />);

    //     // Ensure loading indicator is removed after fetching
    //     await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

    //     // Simulate clicking on the issue title
    //     fireEvent.press(getByText('Leaky Faucet'));

        // Assert that the alert was called with the correct message



        // await waitFor(() => {
        //     expect(Alert.alert).toHaveBeenCalledWith('Leaky Faucet', 'Fix this faucet');
        // });
    });
});
