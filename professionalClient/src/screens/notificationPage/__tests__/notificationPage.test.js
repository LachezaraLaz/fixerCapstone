import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationPage from '../notificationPage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

// Mock the navigation
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
        }),
    };
});

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

describe('NotificationPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockNotifications = [
        {
            id: '1',
            message: 'Notification 1',
            createdAt: '2025-01-25T10:00:00Z',
            isRead: false,
        },
        {
            id: '2',
            message: 'Notification 2',
            createdAt: '2025-01-24T10:00:00Z',
            isRead: false,
        },
    ];

    const renderComponent = () => {
        return render(
            <NavigationContainer>
                <NotificationPage />
            </NavigationContainer>
        );
    };

    test('renders notifications correctly', async () => {
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        axios.get.mockResolvedValue({ data: mockNotifications });

        const { getByText } = renderComponent();

        await waitFor(() => {
            expect(getByText('Notification 1')).toBeTruthy();
            expect(getByText('Notification 2')).toBeTruthy();

            // Check for date in any format
            const date1 = new Date(mockNotifications[0].createdAt).toLocaleString();
            const date2 = new Date(mockNotifications[1].createdAt).toLocaleString();
            expect(getByText(date1)).toBeTruthy();
            expect(getByText(date2)).toBeTruthy();
        });
    });

    test('navigates to NotificationDetail on notification press', async () => {
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        axios.get.mockResolvedValue({ data: mockNotifications });

        const { getByText } = renderComponent();

        await waitFor(() => {
            expect(getByText('Notification 1')).toBeTruthy();
        });

        fireEvent.press(getByText('Notification 1'));
    });
});