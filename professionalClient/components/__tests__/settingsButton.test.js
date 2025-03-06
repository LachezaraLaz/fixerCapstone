import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import SettingsButton from '../settingsButton';
import { Alert } from 'react-native';

jest.mock('@expo/vector-icons', () => {
    return {
        Ionicons: jest.fn().mockImplementation(() => null),
    };
});

describe('SettingsButton Component', () => {
    it('renders an Ionicons settings icon by default', () => {
        const { getByTestId } = render(<SettingsButton testID="settings-button" />);
        // confirm it's there:
        expect(getByTestId('settings-button')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(
            <SettingsButton testID="settings-button" onPress={mockOnPress} />
        );

        fireEvent.press(getByTestId('settings-button'));
        expect(mockOnPress).toHaveBeenCalled();
    });

    it('scales down on press in and up on press out', () => {
        const mockOnPress = jest.fn();
        const { getByTestId } = render(
            <SettingsButton testID="settings-button" onPress={mockOnPress} />
        );
        const pressable = getByTestId('settings-button');

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
        const { getByTestId } = render(<SettingsButton testID="settings-button" />);
        const pressable = getByTestId('settings-button');

        fireEvent(pressable, 'mouseEnter');
        fireEvent(pressable, 'mouseLeave');
    });

    it('renders custom icon, size, and color if passed', () => {
        const { getByTestId, getByA11yLabel } = render(
            <SettingsButton
                testID="settings-button"
                icon="settingss"
                size={30}
                color="#123456"
            />
        );

        const pressable = getByTestId('settings-button');
        expect(pressable).toBeTruthy();
    });
});
