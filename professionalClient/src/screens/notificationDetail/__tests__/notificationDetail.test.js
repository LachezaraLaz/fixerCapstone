import React from 'react';
import { render } from '@testing-library/react-native';
import NotificationDetail from '../notificationDetail'; 

// code to run only this file through the terminal:
// npm run test ./src/screens/notificationDetail/__tests__/notificationDetail.test.js
// or
// npm run test-coverage ./src/screens/notificationDetail/__tests__/notificationDetail.test.js

describe('NotificationDetail Component', () => {
    const mockRoute = {
        params: {
        notification: {
            title: 'Test Notification',
            message: 'This is a test notification message.',
            createdAt: '2025-01-25T12:00:00Z',
        },
        },
    };

    test('renders notification details correctly', () => {
        const { getByText } = render(<NotificationDetail route={mockRoute} />);

        expect(getByText('Test Notification')).toBeTruthy(); // Title
        expect(getByText('This is a test notification message.')).toBeTruthy(); // Message
        expect(getByText('1/25/2025, 12:00:00 PM')).toBeTruthy(); // Date in localized format
    });
});
