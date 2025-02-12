import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfilePage from '../profilePage';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

jest.mock('@expo/vector-icons', () => {
    const MockIonicons = (props) => `Ionicons-${props.name}`;
    const MockMaterialIcons = (props) => `MaterialIcons-${props.name}`;
    return {
        Ionicons: MockIonicons,
        MaterialIcons: MockMaterialIcons,
    };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

jest.mock('axios');

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: jest.fn(),
    };
});

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ProfilePage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockClientData = {
        email: 'testuser@example.com',
        profilePicture: { uri: 'https://via.placeholder.com/100' },
    };

    test('displays loading state initially', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-token');
        axios.get.mockImplementation(() => new Promise(() => {})); // Simulate pending request

        const { getByText } = render(<ProfilePage />);
        expect(getByText('Loading...')).toBeTruthy();
    });

    test('displays profile data after successful fetch', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-token');
        axios.get.mockResolvedValueOnce({ data: mockClientData });

        const { getByText, getByRole } = render(<ProfilePage />);

        await waitFor(() => expect(getByText('testuser@example.com')).toBeTruthy());
    });

    test('displays error message if profile data cannot be fetched', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-token');
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        const { getByText } = render(<ProfilePage />);

        await waitFor(() => expect(getByText('Error loading profile.')).toBeTruthy());
    });

    test('triggers alert when edit button is pressed', async () => {
        const mockNavigate = jest.fn();
        useNavigation.mockReturnValue({
            navigate: mockNavigate,
        });

        AsyncStorage.getItem.mockResolvedValue('fake-token');
        axios.get.mockResolvedValueOnce({ data: mockClientData });

        const { getByText, getByLabelText } = render(<ProfilePage />);

        // Wait for the profile data to load
        await waitFor(() => expect(getByText('testuser@example.com')).toBeTruthy());

        // Press the edit button using accessibilityLabel
        fireEvent.press(getByLabelText('settings button'));

        // Verify the alert is triggered
        expect(mockNavigate).toHaveBeenCalledWith('SettingsPage');
    });
});
