import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInPage from '../SignInPage';
import { LanguageContext } from '../../../../context/LanguageContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { Alert, Text, View, TouchableOpacity } from 'react-native';

// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/signin.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/signin.test.js

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  CommonActions: {
    reset: jest.fn(),
  },
}));

jest.mock('../../../../components/LanguageModal', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return ({ visible, onClose }) => {
    if (!visible) return null;
    return (
      <View>
        <Text>Select Language</Text>
        <TouchableOpacity testID="close-modal" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../../../components/customAlertError', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return ({ visible, title, message, onClose }) => {
    if (!visible) return null;
    return (
      <View>
        <Text>{title}</Text>
        <Text>{message}</Text>
        <TouchableOpacity onPress={onClose}><Text>Close</Text></TouchableOpacity>
      </View>
    );
  };
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const renderWithContext = (props = {}) =>
  render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
      <SignInPage
        navigation={{ navigate: mockNavigate, goBack: mockGoBack, dispatch: jest.fn() }}
        setIsLoggedIn={jest.fn()}
        {...props}
      />
    </LanguageContext.Provider>
  );

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('navigates back on back button press', () => {
    const { getByTestId } = renderWithContext();
    fireEvent.press(getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('opens and closes the language modal', async () => {
    const { getByText, getByTestId, queryByText } = renderWithContext();
    fireEvent.press(getByText(/change language/i));
    expect(getByText('Select Language')).toBeTruthy();

    fireEvent.press(getByTestId('close-modal'));
    await waitFor(() => {
      expect(queryByText('Select Language')).toBeNull();
    });
  });

  test('shows error alert when fields are empty', () => {
    const { getByTestId, getByText } = renderWithContext();
    fireEvent.press(getByTestId('sign-in-button'));
    expect(getByText('Error')).toBeTruthy();
    expect(getByText('Both fields are required')).toBeTruthy();
  });

  test('navigates to SignUpPage and ForgotPasswordPage', () => {
    const { getByText } = renderWithContext();

    fireEvent.press(getByText("Don't have an account? Sign up"));
    expect(mockNavigate).toHaveBeenCalledWith('SignUpPage');

    fireEvent.press(getByText('Forgot Password?'));
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPasswordPage');
  });

  test('signs in successfully and sets tokens', async () => {
    const mockSetIsLoggedIn = jest.fn();
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: {
        token: 'mock-token',
        streamToken: 'mock-stream-token',
        userId: '123',
        userName: 'Test User'
      }
    });

    const { getByPlaceholderText, getByTestId } = renderWithContext({ setIsLoggedIn: mockSetIsLoggedIn });

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByTestId('sign-in-button'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
      expect(CommonActions.reset).toHaveBeenCalled();
    });
  });

  test('shows 400 error alert for wrong input', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 400 } });

    const { getByPlaceholderText, getByTestId, getByText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'badpass');
    fireEvent.press(getByTestId('sign-in-button'));

    await waitFor(() => {
      expect(getByText('Wrong email or password')).toBeTruthy();
    });
  });

  test('shows 403 error alert for unverified account', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 403 } });

    const { getByPlaceholderText, getByTestId, getByText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Email'), 'notverified@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByTestId('sign-in-button'));

    await waitFor(() => {
      expect(getByText('Please verify your email before logging in')).toBeTruthy();
    });
  });

  test('shows fallback error alert for network failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    const { getByPlaceholderText, getByTestId, getByText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Email'), 'fail@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByTestId('sign-in-button'));

    await waitFor(() => {
      expect(getByText('An unexpected error occurred')).toBeTruthy();
    });
  });
});
