import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dropdown from '../dropdown';


// code to run only this file through the terminal:
// npm run test ./components/__tests__/dropdown.test.js
// or
// npm run test-coverage ./components/__tests__/dropdown.test.js


jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

const mockOnValueChange = jest.fn();
const items = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
];

describe('Dropdown Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders dropdown with placeholder', () => {
        const { getByText } = render(
            <Dropdown placeholder="Select an option" items={items} onValueChange={mockOnValueChange} value={null} />
        );
        
        expect(getByText('Select an option')).toBeTruthy();
    });

    test('opens dropdown when pressed', () => {
        const { getByText, getByTestId } = render(
            <Dropdown placeholder="Select an option" items={items} onValueChange={mockOnValueChange} value={null} />
        );
        
        const trigger = getByText('Select an option');
        fireEvent.press(trigger);
        
        expect(getByText('Option 1')).toBeTruthy();
        expect(getByText('Option 2')).toBeTruthy();
        expect(getByText('Option 3')).toBeTruthy();
    });

    test('selects an item and updates value', async () => {
        const { getByText } = render(
            <Dropdown placeholder="Select an option" items={items} onValueChange={mockOnValueChange} value={null} />
        );
        
        fireEvent.press(getByText('Select an option'));
        fireEvent.press(getByText('Option 2'));
        
        await waitFor(() => {
            expect(mockOnValueChange).toHaveBeenCalledWith('option2');
        });
    });

    test('displays selected item as label', () => {
        const { getByText } = render(
            <Dropdown placeholder="Select an option" items={items} onValueChange={mockOnValueChange} value="option3" />
        );
        
        expect(getByText('Option 3')).toBeTruthy();
    });

    test('does not open dropdown when disabled', () => {
        const { getByText, queryByText } = render(
            <Dropdown placeholder="Select an option" items={items} onValueChange={mockOnValueChange} value={null} disabled />
        );
        
        fireEvent.press(getByText('Select an option'));
        
        expect(queryByText('Option 1')).toBeNull();
        expect(queryByText('Option 2')).toBeNull();
        expect(queryByText('Option 3')).toBeNull();
    });
});