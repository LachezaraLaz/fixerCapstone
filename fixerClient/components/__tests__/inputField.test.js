import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InputField from '../inputField'; 
import colors from '../../style/colors';


// code to run only this file through the terminal:
// npm run test ./components/__tests__/inputField.test.js
// or
// npm run test-coverage ./components/__tests__/inputField.test.js


describe('InputField Component', () => {
    test('renders input field with placeholder', () => {
        const { getByPlaceholderText } = render(
            <InputField placeholder="Enter text" value="" onChangeText={jest.fn()} />
        );
        
        expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    test('calls onChangeText when text is entered', () => {
        const mockOnChangeText = jest.fn();
        const { getByPlaceholderText } = render(
            <InputField placeholder="Enter text" value="" onChangeText={mockOnChangeText} />
        );
        
        fireEvent.changeText(getByPlaceholderText('Enter text'), 'Hello');
        expect(mockOnChangeText).toHaveBeenCalledWith('Hello');
    });


    test('displays floating label when there is input', () => {
        const { getByText } = render(
            <InputField placeholder="Enter text" value="Some text" onChangeText={jest.fn()} />
        );
        
        expect(getByText('Enter text')).toBeTruthy(); // Floating label should be visible
    });

    test('does not allow editing when disabled', () => {
        const mockOnChangeText = jest.fn();
        const { getByPlaceholderText } = render(
            <InputField placeholder="Enter text" value="" onChangeText={mockOnChangeText} disabled={true} />
        );
        
        fireEvent.changeText(getByPlaceholderText('Enter text'), 'Attempted Input');
        expect(mockOnChangeText).not.toHaveBeenCalled();
    });

    test('handles focus event and applies animation', () => {
        const { getByPlaceholderText, getByTestId } = render(
            <InputField placeholder="Enter text" value="" onChangeText={jest.fn()} />
        );

        const input = getByPlaceholderText('Enter text');
        const container = getByTestId('input-container'); // Get the container

        // Simulate focus
        fireEvent(input, 'focus');

        // Extract styles manually
        const appliedStyles = container.props.style.find((s) => s.borderColor);

        // Assert that focus state is set (border color should change)
        expect(appliedStyles.borderColor).toBe("#ccc");
    });
});