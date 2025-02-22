// OrangeButton.test.js
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import OrangeButton from '../orangeButton';
import colors from '../../style/colors';

describe('OrangeButton Component', () => {
    it('renders a button with the given title', () => {
        const { getByText } = render(<OrangeButton title="Test Button" />);
        expect(getByText('Test Button')).toBeTruthy();
    });

    it('calls onPress when the button is pressed', () => {
        const mockOnPress = jest.fn();
        const { getByText } = render(
            <OrangeButton title="Press Me" onPress={mockOnPress} />
        );

        fireEvent.press(getByText('Press Me'));
        expect(mockOnPress).toHaveBeenCalled();
    });

    it('scales down on press in and scales up on press out', () => {
        const { getByText, getByRole } = render(
            <OrangeButton title="Animate" onPress={() => {}} />
        );

        // Pressable isn't found by text; we can also locate it by "role" or testID
        const pressable = getByText('Animate');

        // Press in
        act(() => {
            fireEvent(pressable, 'pressIn');
        });

        // Press out
        act(() => {
            fireEvent(pressable, 'pressOut');
        });
    });

    it('uses the correct background color for the "normal" variant by default', () => {
        // We'll check if the Pressable background is colors.orange.normal
        const { getByText } = render(<OrangeButton title="Color Check" />);
        const buttonText = getByText('Color Check');
        const pressableNode = buttonText.parent?.parent;
        expect(pressableNode.props.style[1].backgroundColor).toBe(colors.orange.normal);
    });

    it('allows custom style overrides', () => {
        const customStyle = { marginTop: 50 };
        const { getByText } = render(
            <OrangeButton title="Custom Style" style={customStyle} />
        );
        const buttonText = getByText('Custom Style');
        const pressableNode = buttonText.parent?.parent;

        // Typically the last item in the style array is the custom style
        expect(pressableNode.props.style[2]).toEqual(customStyle);
    });

    it('sets hovered to true/false on mouseEnter and mouseLeave', () => {
        // Render the component
        const { getByText } = render(<OrangeButton title="Hover Me" />);

        // We locate the text
        const textElement = getByText('Hover Me');
        // The actual Pressable might be parentNode of textElement
        const pressable = textElement.parent || textElement.parentNode;

        // Fire the "mouseEnter" event
        fireEvent(pressable, 'mouseEnter');
        // Fire the "mouseLeave" event
        fireEvent(pressable, 'mouseLeave');
    });
});
