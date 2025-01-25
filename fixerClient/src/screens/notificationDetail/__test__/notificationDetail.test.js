import React from 'react';
import { render } from '@testing-library/react-native';
import NotificationDetail from '../notificationDetail';

describe('NotificationDetail Component', () => {
    const mockNotification = {
        title: 'Test Notification',
        message: 'This is a test notification message.',
        createdAt: '2025-01-24T12:34:56.789Z',
    };

    test('renders notification details correctly', () => {
        const route = { params: { notification: mockNotification } };

        const { getByText } = render(<NotificationDetail route={route} />);

        // Check title
        expect(getByText('Test Notification')).toBeTruthy();

        // Check message
        expect(getByText('This is a test notification message.')).toBeTruthy();

        // Check formatted date
        const formattedDate = new Date(mockNotification.createdAt).toLocaleString();
        expect(getByText(formattedDate)).toBeTruthy();
    });

    test('renders with default styling', () => {
        const route = { params: { notification: mockNotification } };

        const { getByText } = render(<NotificationDetail route={route} />);

        // Check that the title is styled correctly
        const title = getByText('Test Notification');
        expect(title.props.style).toMatchObject({ fontSize: 24, fontWeight: 'bold', marginBottom: 10 });

        // Check that the message is styled correctly
        const message = getByText('This is a test notification message.');
        expect(message.props.style).toMatchObject({ fontSize: 16, marginBottom: 20 });

        // Check that the date is styled correctly
        const formattedDate = new Date(mockNotification.createdAt).toLocaleString();
        const date = getByText(formattedDate);
        expect(date.props.style).toMatchObject({ fontSize: 12, color: 'gray' });
    });
});
