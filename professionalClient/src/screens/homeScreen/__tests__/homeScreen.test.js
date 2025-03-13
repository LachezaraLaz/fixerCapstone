import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HomeScreen from '../homeScreen';
import axios from 'axios';
import { Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { AppState } from 'react-native';

// Mock AppState event handling
jest.spyOn(AppState, 'addEventListener');

jest.spyOn(Linking, 'openSettings').mockImplementation(jest.fn());

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

jest.mock('axios');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    multiRemove: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');


describe('HomeScreen', () => {
    const mockNavigate = jest.fn();
    const mockSetIsLoggedIn = jest.fn();
    const mockRoute = { params: { selectedFilters: ['plumber'], distanceRange: [0, 10] } };

    beforeEach(() => {
        jest.clearAllMocks();

        Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
        Location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 37.78825, longitude: -122.4324 } });
        axios.get.mockResolvedValue({
            data: { jobs: [{ _id: '1', title: 'Fix sink', professionalNeeded: 'plumber', latitude: '37.789', longitude: '-122.431', status: 'open' }] },
        });
        useNavigation.mockReturnValue({ navigate: mockNavigate, addListener: jest.fn(() => () => {}) });
    });

    beforeEach(() => jest.clearAllMocks());

    it('renders loading indicator initially', async () => {
        const { getByTestId } = render(
            <HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        // Use waitFor to handle async updates properly
        expect(getByTestId('loading-indicator')).toBeTruthy();

        await waitFor(() => expect(getByTestId('loading-indicator')).toBeTruthy());
    });

    it('fetches issues and renders them', async () => {
        const { getByText } = render(<HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />);
        await waitFor(() => expect(getByText('Fix sink')).toBeTruthy());
    });

    it('filters issues based on selected filters', async () => {
        mockRoute.params.selectedFilters = ['electrician'];
        axios.get.mockResolvedValue({
            data: { jobs: [{ _id: '1', title: 'Fix sink', professionalNeeded: 'plumber', latitude: '37.789', longitude: '-122.4324' }] },
        });
        const { queryByText } = render(<HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />);

        await waitFor(() => expect(queryByText('Fix sink')).toBeNull());
    });

    it('shows error alert if fetching fails', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));

        const alertSpy = jest.spyOn(Alert, 'alert');

        // Mock console.error temporarily to silence Jest logs
        jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />);

        await waitFor(() =>
            expect(alertSpy).toHaveBeenCalledWith('Error', 'An error occurred while fetching issues.')
        );

        // Optional: check if console.error was called (if desired)
        expect(console.error).toHaveBeenCalledWith('Error fetching issues:', expect.any(Error));

        // Restore console.error after the test finishes
        console.error.mockRestore();
    });


    it('handles logout correctly', async () => {
        const { getByText } = render(<HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />);
        await waitFor(() => fireEvent.press(getByText('Logout')));

        expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
    });

    it('recenters map if location permission granted', async () => {
        const { getByTestId, queryByTestId } = render(
            <HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        // Wait for loading indicator to disappear
        await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

        // Wait explicitly for the recenter button to appear
        await waitFor(() => expect(getByTestId('recenterButton')).toBeTruthy());

        // Now trigger the button press
        await act(async () => {
            fireEvent.press(getByTestId('recenterButton'));
        });

        expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    });

    it('calls getCurrentLocation when app returns to foreground', async () => {
        const mockGetCurrentPositionAsync = jest.spyOn(Location, 'getCurrentPositionAsync').mockResolvedValue({
            coords: { latitude: 37.78825, longitude: -122.4324 },
        });

        let appStateChangeCallback;

        AppState.addEventListener.mockImplementation((_, callback) => {
            appStateChangeCallback = callback;
            return { remove: jest.fn() };
        });

        render(<HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />);

        // Initially called during component mount
        await waitFor(() => expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(1));

        // Simulate app state change to 'active'
        act(() => {
            appStateChangeCallback('active');
        });

        // Check if getCurrentLocation called again upon app activation
        await waitFor(() => expect(mockGetCurrentPositionAsync).toHaveBeenCalledTimes(2));
    });

    it('shows alert if location permission is not granted on recenter button press', async () => {
        Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

        const alertSpy = jest.spyOn(Alert, 'alert');

        const { getByTestId, queryByTestId } = render(
            <HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        // Ensure loading finishes first
        await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

        // Press recenter button
        await act(async () => {
            fireEvent.press(getByTestId('recenterButton'));
        });

        // Check alert is shown correctly
        expect(alertSpy).toHaveBeenCalledWith(
            "Location Permission Denied",
            "To use this feature, enable location services in settings.",
            [
                { text: "Back", style: "cancel" },
                { text: "Go to Settings", onPress: expect.any(Function) }
            ]
        );

        // Simulate pressing 'Go to Settings' button on the alert
        const alertButtons = alertSpy.mock.calls[0][2];
        act(() => {
            alertButtons[1].onPress();
        });

        // Check Linking.openSettings() is called
        expect(Linking.openSettings).toHaveBeenCalled();
    });


});
