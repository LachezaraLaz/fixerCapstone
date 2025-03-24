import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInPage from '../signinPage'; // Adjust the import path as necessary
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';


// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/signin.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/signin.test.js


// Mocking axios and AsyncStorage
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));
jest.mock('react-native', () => {
    const actualReactNative = jest.requireActual('react-native'); // Use the actual implementation for all other components
    return {
      ...actualReactNative, // Spread the actual module
      Alert: {
        alert: jest.fn(), // Mock only the Alert component
      },
    };
});
jest.mock('react-native/Libraries/Settings/Settings', () => ({
    Settings: {
      get: jest.fn(),
    },
}));

// Mocking navigation and setIsLoggedIn
const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
    dispatch: jest.fn(),
};
const mockSetIsLoggedIn = jest.fn();

describe('SignInPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly', () => {
        const { getByText, getByPlaceholderText, getByTestId  } = render(
            <SignInPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        // expect(getByText('Sign In')).toBeTruthy();
        expect(getByTestId('signInTitle')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByTestId('sign-in-button')).toBeTruthy();
        expect(getByText("Don't have an account? Sign up")).toBeTruthy();
    });

    test('shows error when email or password is empty', async () => {
        const { getByTestId } = render(
            <SignInPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );
    
        // Simulate pressing the "Sign In" button
        fireEvent.press(getByTestId('sign-in-button'));
    
        // Wait for the alert to be called
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Both fields are required');
        });
    });

    test('handles successful sign in', async () => {
        axios.post.mockResolvedValueOnce({
            status: 200,
            data: {
                token: 'mockToken',
                streamToken: 'mockStreamToken',
                userId: 'mockUserId',
                userName: 'mockUserName',
            },
        });

        const { getByPlaceholderText, getByTestId } = render(
            <SignInPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByTestId('sign-in-button'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/client/signin/',
                {
                    email: 'test@example.com',
                    password: 'password123',
                }
            );
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'mockToken');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('streamToken', 'mockStreamToken');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('userId', 'mockUserId');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('userName', 'mockUserName');
            expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
            expect(mockNavigation.dispatch).toHaveBeenCalled();
        });
    });

    test('handles incorrect email or password', async () => {
        jest.spyOn(Alert, 'alert');
        
        axios.post.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    statusText: 'Wrong email or password',
                },
            },
        });
    
        const { getByPlaceholderText, getByTestId } = render(
            <SignInPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );
    
        fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
        fireEvent.press(getByTestId('sign-in-button'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Wrong email or password');
        });
    });

    test('handles unverified email', async () => {
        jest.spyOn(Alert, 'alert');
        
        axios.post.mockRejectedValueOnce({
            response: {
                status: 403,
            },
        });
    
        const { getByPlaceholderText, getByTestId } = render(
            <SignInPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );
    
        fireEvent.changeText(getByPlaceholderText('Email'), 'unverified@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByTestId('sign-in-button'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Please verify your email before logging in.');
        });
    });

    test('navigates to SignUpPage when "Sign up" is pressed', () => {
        const { getByText } = render(
            <SignInPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        fireEvent.press(getByText("Don't have an account? Sign up"));

        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUpPage');
    });

    test('navigates back when back button is pressed', () => {
        const { getByTestId } = render(
            <SignInPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        fireEvent.press(getByTestId('back-button'));

        expect(mockNavigation.goBack).toHaveBeenCalled();
    });
});