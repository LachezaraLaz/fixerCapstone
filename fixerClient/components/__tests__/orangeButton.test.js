import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OrangeButton from '../orangeButton'; // Adjust the import path as needed


// code to run only this file through the terminal:
// npm run test ./components/__tests__/orangeButton.test.js
// or
// npm run test-coverage ./components/__tests__/orangeButton.test.js


describe('OrangeButton', () => {
    const mockOnPress = jest.fn();

    test('renders correctly with default props', () => {
        const { getByText, getByTestId } = render(
            <OrangeButton title="Click Me" onPress={mockOnPress} testID="button"/>
        );

        // Check if the button and text are rendered
        expect(getByText('Click Me')).toBeTruthy();
        expect(getByTestId('button')).toBeTruthy(); // Ensure testID is applied
    });

    test('triggers onPress when clicked', () => {
        const { getByTestId } = render(
            <OrangeButton title="Click Me" onPress={mockOnPress} testID="button" />
        );

        const button = getByTestId('button');
        fireEvent.press(button);
        expect(mockOnPress).toHaveBeenCalled();
    });

    test('does not trigger onPress when disabled', () => {
        const mockOnPress = jest.fn(); // Ensure a fresh mock is created
    
        const { getByTestId } = render(
            <OrangeButton title="Click Me" onPress={mockOnPress} disabled={true} testID="button" />
        );
    
        const button = getByTestId('button');
        fireEvent.press(button);
    
        expect(mockOnPress).not.toHaveBeenCalled(); // Should pass now
    });

    test('applies the correct styles when pressed', () => {
        const { getByTestId } = render(
            <OrangeButton title="Click Me" onPress={mockOnPress} testID="button" />
        );
    
        const animatedView = getByTestId('button-animated');
        const button = getByTestId('button');
    
        // Simulate press in
        fireEvent(button, 'pressIn');
        expect(animatedView.props.style.transform[0].scale).toBe(1);
    });
    
});