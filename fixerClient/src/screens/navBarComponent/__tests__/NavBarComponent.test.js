import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import NavBar from '../NavBarComponent';
import { Alert } from 'react-native';

// Mock
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        setItem: jest.fn(() => Promise.resolve(null)),
        getItem: jest.fn(() => Promise.resolve(null)),
        removeItem: jest.fn(() => Promise.resolve(null)),
        clear: jest.fn(() => Promise.resolve(null)),
    },
}));

jest.mock('expo-image-picker', () => ({
    __esModule: true,
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    launchImageLibraryAsync: jest.fn(() =>
        Promise.resolve({ canceled: false, assets: [{ uri: 'test-image-uri' }] })
    ),
}));

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
        expect(getByText('Home')).toBeTruthy();
        expect(getByText('My Jobs')).toBeTruthy();
        expect(getByText('Chat')).toBeTruthy();
        expect(getByText('Profile')).toBeTruthy();
    });

    test('navigates to Home tab correctly', () => {
        const { getByText } = renderNavBar();
        fireEvent.press(getByText('Home'));
        expect(getByText('Home')).toBeTruthy();
    });

    test('navigates to JobsPosted tab and shows "My Jobs" label', () => {
        const { getByText } = renderNavBar();
        fireEvent.press(getByText('My Jobs'));
        expect(getByText('My Jobs')).toBeTruthy();
    });

    test('navigates to Chat tab and shows "Chat" label', () => {
        const { getByText } = renderNavBar();
        fireEvent.press(getByText('Chat'));
        expect(getByText('Chat')).toBeTruthy();
    });

    test('navigates to Profile tab and shows "Profile" label', () => {
        const { getByText } = renderNavBar();
        fireEvent.press(getByText('Profile'));
        expect(getByText('Profile')).toBeTruthy();
    });
});
