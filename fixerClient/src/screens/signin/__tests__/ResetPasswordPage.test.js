import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResetPasswordPage from '../ResetPasswordPage';
import { LanguageContext } from '../../../../context/LanguageContext';
import axios from 'axios';
import { Alert, View, Text, TouchableOpacity } from 'react-native';

// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/ResetPasswordPage.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/ResetPasswordPage.test.js

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

const mockNavigate = jest.fn();

const renderWithContext = () =>
  render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
      <ResetPasswordPage route={{ params: { email: 'test@example.com' } }} navigation={{ navigate: mockNavigate }} />
    </LanguageContext.Provider>
  );

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  test('shows error if fields are empty', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = renderWithContext();

    fireEvent.press(getByTestId('reset-password-button'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'All fields are required');
    alertSpy.mockRestore();
  });

  test('shows error if passwords do not match', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId, getByPlaceholderText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Enter new password'), 'abc123');
    fireEvent.changeText(getByPlaceholderText('Confirm new password'), 'different123');
    fireEvent.press(getByTestId('reset-password-button'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Passwords do not match');
    alertSpy.mockRestore();
  });

  test('resets password and navigates on success', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId, getByPlaceholderText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Enter new password'), 'abc123');
    fireEvent.changeText(getByPlaceholderText('Confirm new password'), 'abc123');
    fireEvent.press(getByTestId('reset-password-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Success', 'Password has been reset successfully');
      expect(mockNavigate).toHaveBeenCalledWith('SignInPage');
    });

    alertSpy.mockRestore();
  });

  test('shows server error if reset fails with response', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Token expired' } } });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByTestId, getByPlaceholderText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Enter new password'), 'abc123');
    fireEvent.changeText(getByPlaceholderText('Confirm new password'), 'abc123');
    fireEvent.press(getByTestId('reset-password-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Token expired');
    });

    alertSpy.mockRestore();
  });

  test('shows fallback error if reset fails without response', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByTestId, getByPlaceholderText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Enter new password'), 'abc123');
    fireEvent.changeText(getByPlaceholderText('Confirm new password'), 'abc123');
    fireEvent.press(getByTestId('reset-password-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'An unexpected error occurred');
    });

    alertSpy.mockRestore();
  });

  test('navigates to SignInPage from link', () => {
    const { getByTestId } = renderWithContext();
    fireEvent.press(getByTestId('back-to-signin-button'));
    expect(mockNavigate).toHaveBeenCalledWith('SignInPage');
  });
});
