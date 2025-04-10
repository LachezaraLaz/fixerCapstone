import React from 'react';
import { render } from '@testing-library/react-native';
import NotificationDetail from '../notificationDetail';
import { NavigationContainer } from '@react-navigation/native';

// Mock the navigation
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            goBack: jest.fn(),
        }),
    };
});

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

    const renderComponent = () => {
        return render(
            <NavigationContainer>
                <NotificationDetail route={mockRoute} />
            </NavigationContainer>
        );
    };

    test('renders notification details correctly', () => {
        const { getByText } = renderComponent();

        expect(getByText('Notification Details')).toBeTruthy(); // Header title
        expect(getByText('This is a test notification message.')).toBeTruthy(); // Message

        // Check date format - note this might vary based on locale
        const dateText = new Date(mockRoute.params.notification.createdAt).toLocaleString();
        expect(getByText(dateText)).toBeTruthy();
    });
});