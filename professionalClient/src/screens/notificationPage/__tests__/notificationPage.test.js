import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationPage from '../notificationPage';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('axios');
jest.spyOn(Alert, 'alert');

// Mock the navigation function
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

describe('NotificationPage Component', () => {
    // mock data
    const mockNotifications = [
        {
            _id: '1',
            message: 'Test Notification 1',
            createdAt: '2023-11-07T10:00:00Z',
            isRead: false,
        },
        {
            _id: '2',
            message: 'Test Notification 2',
            createdAt: '2023-11-07T12:00:00Z',
            isRead: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        AsyncStorage.getItem.mockResolvedValue('fake-token');
    });


    test('displays an error message if fetching notifications fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const error = new Error('Function wrap');
        axios.get.mockRejectedValueOnce(error); // Consistent error object

        render(<NotificationPage />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching notifications:',
                error
            );
        });

        // Reset the console.error function to avoid issues with the next tests
        consoleErrorSpy.mockRestore();
    });


    test('navigate to notificationDetail page when a notification is clicked', async () => {
        axios.get.mockResolvedValueOnce({ data: mockNotifications });
        const { getByText } = render(<NotificationPage />);

        await waitFor(() => expect(getByText('Test Notification 1')).toBeTruthy());
        fireEvent.press(getByText('Test Notification 1'));

        // verify that navigation was triggered and is passing the notification id
        expect(mockNavigate).toHaveBeenCalledWith('NotificationDetail', { notification: mockNotifications[0] });
    });
});
