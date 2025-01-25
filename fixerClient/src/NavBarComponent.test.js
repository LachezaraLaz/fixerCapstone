import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import NavBar from './NavBarComponent';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        setItem: jest.fn(() => Promise.resolve(null)),
        getItem: jest.fn(() => Promise.resolve(null)),
        removeItem: jest.fn(() => Promise.resolve(null)),
        clear: jest.fn(() => Promise.resolve(null)),
    },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
    __esModule: true,
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    launchImageLibraryAsync: jest.fn(() =>
        Promise.resolve({ canceled: false, assets: [{ uri: 'test-image-uri' }] })
    ),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
    const MockIonicons = (props) => `Ionicons-${props.name}`;
    return {
        Ionicons: MockIonicons,
    };
});

describe('NavBarComponent', () => {
    const setIsLoggedInMock = jest.fn();

    const renderNavBar = () =>
        render(
            <NavigationContainer>
                <NavBar setIsLoggedIn={setIsLoggedInMock} />
            </NavigationContainer>
        );

    test('renders all tabs with correct labels', () => {
        const { getByText } = renderNavBar();

        // Verify the presence of tab labels
        expect(getByText('Home')).toBeTruthy();
        expect(getByText('JobsPosted')).toBeTruthy();
        expect(getByText('CreateIssue')).toBeTruthy();
        expect(getByText('Chat')).toBeTruthy();
        expect(getByText('Settings')).toBeTruthy();
    });

    test('navigates to Home tab correctly', () => {
        const { getByText } = renderNavBar();

        // Simulate navigation to Home
        fireEvent.press(getByText('Home'));

        // Verify Home tab remains accessible
        expect(getByText('Home')).toBeTruthy();
    });

    test('displays alert for Settings tab', () => {
        const { getByText } = renderNavBar();

        // Simulate pressing the Settings tab
        fireEvent.press(getByText('Settings'));

        // Verify the alert is displayed
        expect(Alert.alert).toHaveBeenCalledWith("Sorry, this feature isn't available yet.");
    });
});
