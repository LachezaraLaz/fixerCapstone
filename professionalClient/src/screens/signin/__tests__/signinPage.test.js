import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInPage from '../signinPage';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { IPAddress } from '../../../../ipAddress';

// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/signin.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/signin.test.js

jest.mock('axios', () => ({
    post: jest.fn().mockResolvedValue({
        status: 200,
        data: { token: 'fake-token' }
    })
}));
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: jest.fn(),
    };
});
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
}));
jest.spyOn(Alert, 'alert');

describe('signIn Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays an error alert when sign in fields are empty', async () => {
        const setIsLoggedIn = jest.fn();
        const mockNavigation = { navigate: jest.fn() };
        const { getByTestId } = render(
            <NavigationContainer>
                <SignInPage navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />
            </NavigationContainer>
        );

        const signInButton = getByTestId('sign-in-button');
        fireEvent.press(signInButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Both fields are required');
        });

        expect(setIsLoggedIn).not.toHaveBeenCalled();
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    test('handles sign-in correctly and navigates to HomeScreen', async () => {
        const setIsLoggedIn = jest.fn();
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        axios.post.mockResolvedValue({
            status: 200,
            data: { token: 'fake-token' },
        });

        const { getByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <SignInPage setIsLoggedIn={setIsLoggedIn} />
            </NavigationContainer>
        );

        fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        const signInButton = getByTestId('sign-in-button');
        fireEvent.press(signInButton)

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(`https://fixercapstone-production.up.railway.app/professional/signin/`, {
                email: 'user@example.com',
                password: 'password123'
            });
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
            expect(setIsLoggedIn).toHaveBeenCalledWith(true);
            expect(Alert.alert).toHaveBeenCalledWith('Signed in successfully');
            expect(mockNavigate).toHaveBeenCalledWith('MainTabs');
        });
    });

    test('displays an error alert when email does not exist', async () => {
        const setIsLoggedIn = jest.fn();
        const mockNavigation = { navigate: jest.fn() };

        // Mock the API response for a non-existent email scenario
        axios.post.mockRejectedValueOnce({
            response: {
                status: 400,  // Assuming the API returns 400 for non-existent email or wrong credentials
                data: { statusText: 'Wrong email or password' }
            }
        });

        const { getByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <SignInPage navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />
            </NavigationContainer>
        );

        // Inputting an email that does not exist
        fireEvent.changeText(getByPlaceholderText('Email'), 'nonexistent@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        const signInButton = getByTestId('sign-in-button');
        fireEvent.press(signInButton);

        await waitFor(() => {
            // Checking that the error message is displayed
            expect(axios.post).toHaveBeenCalledWith(`https://fixercapstone-production.up.railway.app/professional/signin/`, {
                email: 'nonexistent@example.com',
                password: 'password123'
            });
            expect(Alert.alert).toHaveBeenCalledWith("Error", 'Wrong email or password');
        });

        // Ensuring no navigation or login state changes occurred
        expect(setIsLoggedIn).not.toHaveBeenCalled();
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
        // expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    test('navigates to SignUpPage when "Sign up" link is pressed', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByText } = render(
                <SignInPage setIsLoggedIn={jest.fn()} />
        );

        const signUpLink = getByText("Don't have an account? Sign up");
        fireEvent.press(signUpLink);

        expect(mockNavigate).toHaveBeenCalledWith('SignUpPage');
    });
});