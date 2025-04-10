import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordPage from '../ForgotPasswordPage';
import { LanguageContext } from '../../../../context/LanguageContext';
import axios from 'axios';
import { Alert, Text, View, TouchableOpacity } from 'react-native';

// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/ForgotPasswordPage.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/ForgotPasswordPage.test.js

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
}));

// Mock modal
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

// Mock alert components
jest.mock('../../../../components/customAlertError', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return ({ visible, title, message, onClose }) => {
    if (!visible) return null;
    return (
      <View>
        <Text>{title}</Text>
        <Text>{message}</Text>
        <TouchableOpacity onPress={onClose}><Text>Close Error</Text></TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../../../components/customAlertSuccess', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return ({ visible, title, message, onClose }) => {
    if (!visible) return null;
    return (
      <View>
        <Text>{title}</Text>
        <Text>{message}</Text>
        <TouchableOpacity onPress={onClose}><Text>Close Success</Text></TouchableOpacity>
      </View>
    );
  };
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const renderWithContext = () =>
  render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
      <ForgotPasswordPage navigation={{ navigate: mockNavigate, goBack: mockGoBack }} />
    </LanguageContext.Provider>
  );

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('navigates back when back button is pressed', () => {
    const { getByTestId } = renderWithContext();
    fireEvent.press(getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('shows language modal and closes it', async () => {
    const { getByText, getByTestId, queryByText } = renderWithContext();

    fireEvent.press(getByText(/change language/i));
    expect(getByText('Select Language')).toBeTruthy();

    fireEvent.press(getByTestId('close-modal'));
    await waitFor(() => {
      expect(queryByText('Select Language')).toBeNull();
    });
  });

  test('shows error alert when email is empty', async () => {
    const { getByText } = renderWithContext();
    fireEvent.press(getByText('Send Reset PIN'));

    await waitFor(() => {
      expect(getByText('Error')).toBeTruthy();
      expect(getByText('The email field is required.')).toBeTruthy();
    });
  });

  test('shows success alert and Enter PIN button when email is valid', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    const { getByText, getByPlaceholderText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@example.com');
    fireEvent.press(getByText('Send Reset PIN'));

    await waitFor(() => {
      expect(getByText('Success')).toBeTruthy();
      expect(getByText('Please check your email for a PIN to reset your password')).toBeTruthy();
    });

    // Simulate pressing the success alert close button
    fireEvent.press(getByText('Close Success'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('EnterPin', { email: 'test@example.com' });
    });
  });

  test('navigates to SignInPage when button is pressed', () => {
    const { getByText } = renderWithContext();
    fireEvent.press(getByText('Sign In'));
    expect(mockNavigate).toHaveBeenCalledWith('SignInPage');
  });

  test('shows error alert if axios fails with response', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: true } }
    });

    const { getByText, getByPlaceholderText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText(/email/i), 'fail@example.com');
    fireEvent.press(getByText('Send Reset PIN'));

    await waitFor(() => {
      expect(getByText('Error')).toBeTruthy();
      expect(getByText('Could not find your account')).toBeTruthy();
    });
  });

  test('shows error alert if axios fails without response', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    const { getByText, getByPlaceholderText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText(/email/i), 'fail@example.com');
    fireEvent.press(getByText('Send Reset PIN'));

    await waitFor(() => {
      expect(getByText('An unexpected error occurred')).toBeTruthy();
    });
  });
});
