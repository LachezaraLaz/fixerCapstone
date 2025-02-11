import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationPage from '../notificationPage'; // Update with the correct path
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// code to run only this file through the terminal:
// npm run test ./src/screens/notificationPage/__tests__/notificationPage.test.js
// or
// npm run test-coverage ./src/screens/notificationPage/__tests__/notificationPage.test.js

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

describe('NotificationPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockNotifications = [
        {
        _id: '1',
        message: 'Notification 1',
        createdAt: '2025-01-25T10:00:00Z',
        isRead: false,
        },
        {
        _id: '2',
        message: 'Notification 2',
        createdAt: '2025-01-24T10:00:00Z',
        isRead: true,
        },
    ];

    test('renders notifications correctly', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockResolvedValueOnce({ data: mockNotifications });

        const { getByText } = render(<NotificationPage />);

        await waitFor(() => {
        expect(getByText('Notification 1')).toBeTruthy();
        expect(getByText('Notification 2')).toBeTruthy();
        expect(getByText('2025-01-24, 5:00:00 a.m.')).toBeTruthy();
        expect(getByText('2025-01-24, 5:00:00 a.m.')).toBeTruthy();
        });
    });

    test('navigates to NotificationDetail on notification press', async () => {
        const mockNavigate = jest.fn();
        useNavigation.mockReturnValue({ navigate: mockNavigate });

        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockResolvedValueOnce({ data: mockNotifications });

        const { getByText } = render(<NotificationPage />);

        await waitFor(() => {
        expect(getByText('Notification 1')).toBeTruthy();
        });

        const notification1 = getByText('Notification 1');
        fireEvent.press(notification1);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('NotificationDetail', {
                notification: mockNotifications[0],
            });
        });
    });
});
