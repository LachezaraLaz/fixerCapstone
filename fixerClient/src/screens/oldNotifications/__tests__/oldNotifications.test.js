// OldNotificationsPage.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OldNotifications from '../oldNotifications';
import { useRoute, useNavigation } from '@react-navigation/native';

// Mock out useNavigation and useRoute from React Navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useRoute: jest.fn(),
    useNavigation: jest.fn(),
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

    it('displays a fallback message when oldNotifications is empty', () => {
        // By default, oldNotifications is empty from our beforeEach
        const { getByText } = render(<OldNotifications />);
        expect(getByText('No old notifications to display.')).toBeTruthy();
    });

    it('renders old notifications when provided', () => {
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

    it('calls goBack when pressing the back button', () => {
        const { getByTestId } = render(<OldNotifications />);

        // Press the back button
        fireEvent.press(getByTestId('old-notifs-back-button'));
        expect(mockGoBack).toHaveBeenCalled();
    });
});
