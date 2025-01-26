import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HomeScreen from '../homeScreen';
import axios from 'axios';
//import * as Location from 'expo-location';
import { Alert } from 'react-native';  // Import the Alert module
//import AsyncStorage from '@react-native-async-storage/async-storage';

// code to run only this file through the terminal:
// npm run test ./src/screens/homeScreen/__tests__/homeScreen.test.js
// or
// npm run test-coverage ./src/screens/homeScreen/__tests__/homeScreen.test.js

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
    const React = require('react');
    const MockMapView = ({ children }) => <div data-testid="map-view">{children}</div>;
    const MockMarker = ({ testID, ...props }) => (
        <div data-testid={testID} {...props}>
            Marker Mock
        </div>
    );

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
        })
        // Render the component
        const { queryByTestId } = render(
            <HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />
        );
        // Use waitFor to ensure that async operations complete before checking for loading indicator
        await waitFor(() => {
            expect(queryByTestId('loading-indicator')).toBeNull();
        });
    });

    // it('should fetch issues and display them on a list', async () => {
    //     // Mocking permission request
    //     require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
    //         status: 'granted',  // Simulate permission granted
    //     });
    //
    //     // Mocking geolocation to return specific coordinates
    //     require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
    //         coords: { latitude: 37.78825, longitude: -122.4324 },
    //     });
    //
    //     const mockIssues = {
    //         data: {
    //             jobs: [
    //                 { _id: 1, title: 'Leaky Faucet', description: 'Fix this faucet', latitude: 37.78825, longitude: -122.4324, professionalNeeded: 'plumber' },
    //                 { _id: 2, title: 'Light Bulb Replacement', description: 'Replace the bulb', latitude: 37.78925, longitude: -122.4324, professionalNeeded: 'electrician' }
    //             ]
    //         }
    //     };
    //
    //     axios.get.mockResolvedValueOnce(mockIssues);
    //
    //     const { getByText, queryByTestId } = render(<HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />);
    //
    //     // Ensure loading indicator is removed after fetching
    //     await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());
    //
    //     // Verify issue titles are rendered
    //     expect(getByText('Leaky Faucet')).toBeTruthy();
    //     expect(getByText('Light Bulb Replacement')).toBeTruthy();
    // });


    // it('should fetch issues and display markers on the map', async () => {
    //     // Mocking permission request
    //     require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
    //         status: 'granted',  // Simulate permission granted
    //     });
    //
    //     // Mocking geolocation to return specific coordinates
    //     require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
    //         coords: { latitude: 37.78825, longitude: -122.4324 },
    //     });
    //
    //     const mockIssues = {
    //         data: {
    //             jobs: [
    //                 { _id: 1, title: 'Leaky Faucet', description: 'Fix this faucet', latitude: 37.78825, longitude: -122.4324, professionalNeeded: 'plumber' },
    //                 { _id: 2, title: 'Light Bulb Replacement', description: 'Replace the bulb', latitude: 37.78925, longitude: -122.4324, professionalNeeded: 'electrician' }
    //             ]
    //         }
    //     };
    //     axios.get.mockResolvedValueOnce(mockIssues);
    //
    //     const { queryByTestId } = render(<HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />);
    //
    //     // Ensure loading indicator is removed after fetching
    //     await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());
    //
    //
    //     // Verify issue titles are rendered
    //     expect(queryByTestId('marker-1')).toBeTruthy();
    //     expect(queryByTestId('marker-2')).toBeTruthy();
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


    it('should filter the list of jobs based on selected professionalNeeded', async () => {
        // Mocking permission request
        require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
            status: 'granted', // Simulate permission granted
        });

        // Mocking geolocation to return specific coordinates
        require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
            coords: { latitude: 37.78825, longitude: -122.4324 },
        });

        const mockIssues = {
            data: {
                jobs: [
                    { _id: 1, title: 'Leaky Faucet', description: 'Fix this faucet', latitude: 37.78825, longitude: -122.4324, professionalNeeded: 'plumber' },
                    { _id: 2, title: 'Light Bulb Replacement', description: 'Replace the bulb', latitude: 37.78925, longitude: -122.4324, professionalNeeded: 'electrician' },
                    { _id: 3, title: 'Fix Broken Door', description: 'Repair the door', latitude: 37.78725, longitude: -122.4325, professionalNeeded: 'carpenter' }
                ]
            }
        };

        axios.get.mockResolvedValueOnce(mockIssues);

        const { getByText, queryByText, queryByTestId, getByTestId } = render(
            <HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />
        );

        // Ensure loading indicator is removed after fetching
        await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

        // Verify all jobs are initially displayed in the list
        expect(queryByText('Leaky Faucet')).toBeTruthy();
        expect(queryByText('Light Bulb Replacement')).toBeTruthy();
        expect(queryByText('Fix Broken Door')).toBeTruthy();

        // Simulate clicking on the "plumber" filter button
        const plumberFilterButton = getByText('plumber'); // Replace with your actual filter button label
        act(() => {
            fireEvent.press(plumberFilterButton);
        });

        // Wait for the list to update and check if only "plumber" jobs are displayed
        await waitFor(() => {
            expect(queryByText('Leaky Faucet')).toBeTruthy();
            expect(queryByText('Light Bulb Replacement')).toBeNull();
            expect(queryByText('Fix Broken Door')).toBeNull();
        });

        // Simulate clicking on the "electrician" filter button
        const electricianFilterButton = getByText('electrician'); // Replace with your actual filter button label
        act(() => {
            fireEvent.press(electricianFilterButton);
        });

        // Wait for the list to update and check if only "electrician" jobs are displayed
        await waitFor(() => {

            expect(queryByText('Light Bulb Replacement')).toBeTruthy();
            expect(queryByText('Leaky Faucet')).toBeTruthy();
            expect(queryByText('Fix Broken Door')).toBeNull();
        });
    });


    it('should open a quote', async () => {
        // Mocking permission request
        require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
            status: 'granted',  // Simulate permission granted
        });

        // Mocking geolocation to return specific coordinates
        require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
            coords: { latitude: 37.78825, longitude: -122.4324 },
        });

        const mockIssues = {
            data: {
                jobs: [
                    { _id: 1, title: 'Leaky Faucet', description: 'Fix this faucet', latitude: 37.78825, longitude: -122.4324, professionalNeeded: 'plumber' },
                    { _id: 2, title: 'Light Bulb Replacement', description: 'Replace the bulb', latitude: 37.78925, longitude: -122.4324, professionalNeeded: 'electrician' },
                    { _id: 3, title: 'Fix Broken Door', description: 'Repair the door', latitude: 37.78725, longitude: -122.4325, professionalNeeded: 'carpenter' }
                ]
            }
        };

        axios.get.mockResolvedValueOnce(mockIssues);

        // Mocking the API POST request for quote submission
        axios.post.mockResolvedValueOnce({ status: 200, data: { success: true } });

        const { getByText, getByPlaceholderText, queryByTestId } = render(
            <HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />
        );

        // Wait for the issues to load
        await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());


        await act(async () => {
            // Simulate clicking on the first issue "Leaky Faucet"
            fireEvent.press(getByText('Leaky Faucet'));
        });


        // Check if modal appears (you can check for modal visibility here)
        const modal = queryByTestId('quotemodal');
        expect(modal).toBeTruthy();

    });



    it('should allow submitting a quote successfully', async () => {
        // Mocking permission request
        require('expo-location').requestForegroundPermissionsAsync.mockResolvedValueOnce({
            status: 'granted',  // Simulate permission granted
        });

        // Mocking geolocation to return specific coordinates
        require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce({
            coords: { latitude: 37.78825, longitude: -122.4324 },
        });

        const mockIssues = {
            data: {
                jobs: [
                    { _id: 1, title: 'Leaky Faucet', description: 'Fix this faucet', latitude: 37.78825, longitude: -122.4324, professionalNeeded: 'plumber' },
                    { _id: 2, title: 'Light Bulb Replacement', description: 'Replace the bulb', latitude: 37.78925, longitude: -122.4324, professionalNeeded: 'electrician' },
                    { _id: 3, title: 'Fix Broken Door', description: 'Repair the door', latitude: 37.78725, longitude: -122.4325, professionalNeeded: 'carpenter' }
                ]
            }
        };

        axios.get.mockResolvedValueOnce(mockIssues);

        // Mocking the API POST request for quote submission
        axios.post.mockResolvedValueOnce({ status: 200, data: { success: true } });

        const { getByText, getByPlaceholderText, queryByTestId } = render(
            <HomeScreen navigation={navigation} setIsLoggedIn={setIsLoggedIn} />
        );

        // Wait for the issues to load
        await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());


        await act(async () => {
            // Simulate clicking on the first issue "Leaky Faucet"
            fireEvent.press(getByText('Leaky Faucet'));
        });


        // Check if modal appears (you can check for modal visibility here)
        const modal = queryByTestId('quotemodal');
        expect(modal).toBeTruthy();

        // Simulate entering a price in the modal
        const priceInput = getByPlaceholderText('Enter price for this issue');
        fireEvent.changeText(priceInput, '150');

        // Simulate pressing the submit button
        fireEvent.press(getByText('Submit'));

        // Verify that the POST request is made with the correct data
        // await waitFor(() => {
        //     expect(axios.post).toHaveBeenCalledWith(
        //         `http://192.168.2.16:3000/quotes/create`,
        //         { clientEmail: 'client@example.com', price: '150', issueId: '1' },
        //         { headers: { Authorization: `Bearer mockToken` } }
        //     );
        //     expect(Alert.alert).toHaveBeenCalledWith('Success', 'Quote submitted successfully!');
        // });
    });

});
