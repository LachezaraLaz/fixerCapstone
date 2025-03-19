import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PasswordField from '../passwordField'; // Adjust path accordingly


// code to run only this file through the terminal:
// npm run test ./components/__tests__/passwordField.test.js
// or
// npm run test-coverage ./components/__tests__/passwordField.test.js

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe('PasswordField Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly with placeholder', () => {
        const { getByPlaceholderText } = render(
            <PasswordField placeholder="Enter Password" value="" onChangeText={jest.fn()} />
        );

        expect(getByPlaceholderText('Enter Password')).toBeTruthy();
    });

    test('toggles password visibility when eye icon is pressed', () => {
        const { getByDisplayValue, getByTestId } = render(
            <PasswordField placeholder="Enter Password" value="mypassword" onChangeText={jest.fn()} />
        );
    
        const input = getByDisplayValue('mypassword'); // Use display value instead of placeholder
        const eyeIcon = getByTestId('toggle-visibility'); // Find the eye icon
    
        // Initially, the password should be hidden (secureTextEntry should be true)
        expect(input.props.secureTextEntry).toBe(true);
    
        // Simulate pressing the eye icon
        fireEvent.press(eyeIcon);
    
        // Password should now be visible (secureTextEntry should be false)
        expect(input.props.secureTextEntry).toBe(false);
    
        // Simulate pressing the eye icon again
        fireEvent.press(eyeIcon);
    
        // Password should be hidden again
        expect(input.props.secureTextEntry).toBe(true);
    });    

    test('calls onChangeText when input text changes', () => {
        const mockOnChangeText = jest.fn();
        const { getByPlaceholderText } = render(
            <PasswordField placeholder="Enter Password" value="" onChangeText={mockOnChangeText} />
        );

        const input = getByPlaceholderText('Enter Password');

        fireEvent.changeText(input, 'newpassword');

        expect(mockOnChangeText).toHaveBeenCalledWith('newpassword');
    });

    test('displays an error message when isError is true', () => {
        const { getByText } = render(
            <PasswordField
                placeholder="Enter Password"
                value=""
                onChangeText={jest.fn()}
                isError={true}
                errorMessage="Password is required"
            />
        );

        expect(getByText('Password is required')).toBeTruthy();
    });

    test('does not display error message when isError is false', () => {
        const { queryByText } = render(
            <PasswordField
                placeholder="Enter Password"
                value=""
                onChangeText={jest.fn()}
                isError={false}
                errorMessage="Password is required"
            />
        );

        expect(queryByText('Password is required')).toBeNull();
    });
});
