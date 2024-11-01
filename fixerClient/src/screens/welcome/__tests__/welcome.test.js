import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomePage from '../welcomePage'; // Adjust the import path as necessary

// code to run only this file through the terminal:
// npm run test ./src/screens/welcome/__tests__/welcome.test.js
// or
// npm run test-coverage ./src/screens/welcome/__tests__/welcome.test.js

describe('WelcomePage Navigation', () => {
    it('navigates to SignInPage when the "Sign In" button is pressed', async () => {
        const mockNavigation = { navigate: jest.fn() };
        const { getByText } = render(<WelcomePage navigation={mockNavigation} />);

        const signInButton = getByText('Sign In');
        fireEvent.press(signInButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignInPage');
    });

    it('navigates to SignUpPage when the "Sign Up" button is pressed', async () => {
        const mockNavigation = { navigate: jest.fn() };
        const { getByText } = render(<WelcomePage navigation={mockNavigation} />);

        const signUpButton = getByText('Sign Up');
        fireEvent.press(signUpButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUpPage');
    });
});
