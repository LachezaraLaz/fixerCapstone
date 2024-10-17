import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInPage from '../signinPage'; // Adjust the import path as necessary
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('axios', () => ({
    post: jest.fn().mockResolvedValue({
        status: 200,
        data: { token: 'fake-token' }
    })
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
}));
jest.spyOn(Alert, 'alert');

test('displays an error alert when sign in fields are empty', async () => {
    const setIsLoggedIn = jest.fn();
    const mockNavigation = { navigate: jest.fn() };
    const { getByTestId } = render(<SignInPage navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />);

    const signInButton = getByTestId('sign-in-button');
    fireEvent.press(signInButton);

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Both fields are required');
    });

    // Ensuring no navigation or login state changes occurred
    expect(setIsLoggedIn).not.toHaveBeenCalled();
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
});

test('handles sign-in correctly and navigates to HomeScreen', async () => {
    const setIsLoggedIn = jest.fn();
    const mockNavigation = { navigate: jest.fn() };

    axios.post.mockResolvedValue({
        status: 200,
        data: { token: 'fake-token' },
    });

    const { getByTestId, getByPlaceholderText } = render(<SignInPage navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    const signInButton = getByTestId('sign-in-button');
    fireEvent.press(signInButton)

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('http://10.0.0.56:3000/professional/signin/', {
            email: 'user@example.com',
            password: 'password123'
        });
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
        expect(setIsLoggedIn).toHaveBeenCalledWith(true);
        expect(Alert.alert).toHaveBeenCalledWith('Signed in successfully');
        expect(mockNavigation.navigate).toHaveBeenCalledWith('HomeScreen');
    });
});