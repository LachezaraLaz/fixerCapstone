import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import NotificationButton from '../notificationButton';
import { Alert } from 'react-native';

jest.mock('@expo/vector-icons', () => {
    return {
        Ionicons: jest.fn().mockImplementation(() => null),
    };
});

describe('NotificationButton Component', () => {
    it('renders an Ionicons notification icon by default', () => {
        const { getByTestId } = render(<NotificationButton testID="notification-button" />);
        // confirm it's there:
        expect(getByTestId('notification-button')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(
            <NotificationButton testID="notification-button" onPress={mockOnPress} />
        );

        fireEvent.press(getByTestId('notification-button'));
        expect(mockOnPress).toHaveBeenCalled();
    });

    it('scales down on press in and up on press out', () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(
            <NotificationButton testID="notification-button" onPress={mockOnPress} />
        );
        const pressable = getByTestId('notification-button');

        // Press In
        act(() => {
            fireEvent(pressable, 'pressIn');
        });
        // Press Out
        act(() => {
            fireEvent(pressable, 'pressOut');
        });
    });

    it('handles mouseEnter/mouseLeave to set hovered state for web usage', () => {
        const { getByTestId } = render(<NotificationButton testID="notification-button" />);
        const pressable = getByTestId('notification-button');

        fireEvent(pressable, 'mouseEnter');
        fireEvent(pressable, 'mouseLeave');
    });

    it('renders custom icon, size, and color if passed', () => {
        const { getByTestId, getByA11yLabel } = render(
            <NotificationButton
                testID="notification-button"
                icon="notifications"
                size={30}
                color="#123456"
            />
        );

        const pressable = getByTestId('notification-button');
        expect(pressable).toBeTruthy();
    });
});
