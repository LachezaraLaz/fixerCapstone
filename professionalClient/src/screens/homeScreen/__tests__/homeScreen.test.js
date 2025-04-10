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

jest.mock('react-native/Libraries/Animated/NativeAnimatedModule', () => ({
    addListener: jest.fn(),
    removeListeners: jest.fn(),
}));

jest.mock('../../chat/chatContext', () => ({
    useChatContext: () => ({
        chatClient: { disconnectUser: jest.fn().mockResolvedValue() }
    }),
}));


jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    return {
        ...Reanimated,
        useAnimatedProps: jest.fn(),
        useSharedValue: jest.fn(() => ({ value: 0 })),
        useAnimatedStyle: jest.fn(() => ({})),
    };
});


jest.mock('axios');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => {
    let store = {
        userId: 'dummy-user-id',
        token : 'dummy-jwt',
    };

    const mockAsyncStorage = {
        getItem:    jest.fn(key   => Promise.resolve(store[key] ?? null)),
        setItem:    jest.fn((k,v) => { store[k] = v; return Promise.resolve(); }),
        removeItem: jest.fn(key   => { delete store[key]; return Promise.resolve(); }),
        multiRemove: jest.fn(keys => { keys.forEach(k => delete store[k]); return Promise.resolve(); }),

        // handy helper so tests can reset state
        __reset: () => { store = {}; },
    };

    module.exports = {
        __esModule: true,   // makes `import AsyncStorage from …` work
        default: mockAsyncStorage,
    };
});


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

        jest.doMock('../../chat/chatContext', () => ({
            useChatContext: () => ({
                chatClient: { disconnectUser: jest.fn().mockResolvedValue() } // Default: success
            }),
        }));

        Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
        Location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 37.78825, longitude: -122.4324 } });
        axios.get.mockResolvedValue({
            data: { jobs: [{ _id: '1', title: 'Fix sink', professionalNeeded: 'plumber', latitude: '37.789', longitude: '-122.431', status: 'open' }] },
        });
        useNavigation.mockReturnValue({ navigate: mockNavigate, addListener: jest.fn(() => () => {}) });
    });

    beforeEach(() => jest.clearAllMocks());

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

        // Mock the console.error temporarily to silence Jest logs
        jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />);

        await waitFor(() =>
            expect(alertSpy).toHaveBeenCalledWith('Error', 'An error occurred while fetching issues.')
        );

        // Check if console.error was called
        expect(console.error).toHaveBeenCalledWith('Error fetching issues:', expect.any(Error));

        // Restore console.error after the test finishes
        console.error.mockRestore();
    });

    it('recenters map if location permission granted', async () => {
        const { getByTestId, queryByTestId } = render(
            <HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        // Wait for loading indicator to disappear
        await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

        // Wait for the recenter button to appear
        await waitFor(() => expect(getByTestId('recenterButton')).toBeTruthy());

        // Now click on the button recenterButton
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

    it('shows CustomAlertLocation and opens settings when location permission is denied', async () => {
        Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

        const { getByTestId, queryByTestId, getByText } = render(
            <HomeScreen route={mockRoute} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());

        await act(async () => {
            fireEvent.press(getByTestId('recenterButton'));
        });

        expect(getByText('Location Permission Denied')).toBeTruthy();
        expect(
            getByText('To use this feature, enable location services in settings.')
        ).toBeTruthy();

        fireEvent.press(getByText('Go to Settings'));

        expect(Linking.openSettings).toHaveBeenCalled();
    });
});
