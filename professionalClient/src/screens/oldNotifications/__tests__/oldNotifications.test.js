// OldNotificationsPage.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OldNotifications from '../oldNotifications';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// code to run only this file through the terminal:
// npm run test ./src/screens/oldNotifications/__tests__/oldNotifications.test.js
// or
// npm run test-coverage ./src/screens/oldNotifications/__tests__/oldNotifications.test.js

// Mock out useNavigation and useRoute from React Navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useRoute: jest.fn(),
    useNavigation: jest.fn(),
}));

jest.mock('axios', () => ({
    __esModule: true,
    default: {
        patch: jest.fn(),
    },
}));

//async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
}));

describe('OldNotifications', () => {
    const mockGoBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks for navigation and route
        useNavigation.mockReturnValue({
            goBack: mockGoBack,
        });

        useRoute.mockReturnValue({
            params: { oldNotifications: [] },
        });
    });

    test('displays a fallback message when oldNotifications is empty', () => {
        // By default, oldNotifications is empty from our beforeEach
        const { getByText } = render(<OldNotifications />);
        expect(getByText('No old notifications to display.')).toBeTruthy();
    });

    test('renders old notifications when provided', () => {
        // Provide some mock data
        const fakeOldNotifications = [
            { id: '1', message: 'Old Notification #1', createdAt: '2024-03-01T00:00:00Z', isRead: true },
            { id: '2', message: 'Old Notification #2', createdAt: '2024-03-02T00:00:00Z', isRead: true },
        ];

        // Mock the route to have non-empty notifications
        useRoute.mockReturnValueOnce({
            params: { oldNotifications: fakeOldNotifications },
        });

        const { getByText } = render(<OldNotifications />);

        // Confirm that each message is shown
        expect(getByText('Old Notification #1')).toBeTruthy();
        expect(getByText('Old Notification #2')).toBeTruthy();
    });

    test('calls goBack when pressing the back button', () => {
        const { getByTestId } = render(<OldNotifications />);

        // Press the back button
        fireEvent.press(getByTestId('old-notifs-back-button'));
        expect(mockGoBack).toHaveBeenCalled();
    });

    test('toggles read status and navigates to NotificationDetail on tap', async () => {
        const fakeNotification = {
            id: '123',
            _id: '123',
            message: 'Old Notification Test',
            createdAt: new Date().toISOString(),
            isRead: false,
        };

        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({
            goBack: jest.fn(),
            navigate: mockNavigate,
        });

        useRoute.mockReturnValue({
            params: { oldNotifications: [fakeNotification] },
        });

        AsyncStorage.getItem.mockResolvedValue('mock-token');
        axios.patch.mockResolvedValue({}); // make sure this works with default import

        const { getByText } = render(<OldNotifications />);

        await waitFor(() => {
            fireEvent.press(getByText('Old Notification Test'));
        });

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith(
                `https://fixercapstone-production.up.railway.app/notification/${fakeNotification.id}/read`,
                { isRead: true },
                { headers: { Authorization: 'Bearer mock-token' } }
            );

            expect(mockNavigate).toHaveBeenCalledWith('NotificationDetail', {
                notification: fakeNotification,
            });
        });
    });
});
