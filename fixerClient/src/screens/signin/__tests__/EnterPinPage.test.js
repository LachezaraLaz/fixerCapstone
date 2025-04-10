import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EnterPinPage from '../EnterPinPage';
import axios from 'axios';
import { Alert } from 'react-native';
import { LanguageContext } from '../../../../context/LanguageContext';

// code to run only this file through the terminal:
// npm run test ./src/screens/signin/__tests__/EnterPinPage.test.js
// or
// npm run test-coverage ./src/screens/signin/__tests__/EnterPinPage.test.js

jest.mock('axios');

const mockNavigate = jest.fn();
const mockRoute = { params: { email: 'test@example.com' } };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
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
          <TouchableOpacity onPress={onClose} testID="close-language-modal">
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      );
    };
});
  

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const renderWithContext = () =>
  render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
      <EnterPinPage navigation={{ navigate: mockNavigate }} route={mockRoute} />
    </LanguageContext.Provider>
  );

describe('EnterPinPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders title and validate button', () => {
    const { getByText, getByPlaceholderText } = renderWithContext();
    expect(getByText('Enter PIN')).toBeTruthy();
    expect(getByPlaceholderText('Enter your PIN')).toBeTruthy();
    expect(getByText('Validate PIN')).toBeTruthy();
  });

  test('shows alert if pin is empty', () => {
    const { getByText } = renderWithContext();
    fireEvent.press(getByText('Validate PIN'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'PIN field is required');
  });

  test('submits pin and navigates on success', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    const { getByPlaceholderText, getByText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Enter your PIN'), '123456');
    fireEvent.press(getByText('Validate PIN'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'PIN validated successfully');
      expect(mockNavigate).toHaveBeenCalledWith('ResetPasswordPage', {
        email: 'test@example.com',
      });
    });
  });

  test('shows error alert on invalid pin', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Invalid or expired PIN',
        },
      },
    });

    const { getByPlaceholderText, getByText } = renderWithContext();

    fireEvent.changeText(getByPlaceholderText('Enter your PIN'), '999999');
    fireEvent.press(getByText('Validate PIN'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid or expired PIN');
    });
  });

  test('navigates back to SignInPage', () => {
    const { getByText } = renderWithContext();
    fireEvent.press(getByText('Back to Sign In'));
    expect(mockNavigate).toHaveBeenCalledWith('SignInPage');
  });

  test('opens and closes the language modal when buttons are pressed', async () => {
    const { getByText, getByTestId, queryByText } = renderWithContext();
  
    // 🌍 Tap language button
    fireEvent.press(getByText(/change language/i));
  
    // Modal should appear
    const modalText = await waitFor(() => getByText(/select language/i));
    expect(modalText).toBeTruthy();
  
    // Tap the close button
    fireEvent.press(getByTestId('close-language-modal'));
  
    // Modal content should disappear
    await waitFor(() => {
      expect(queryByText(/select language/i)).toBeNull();
    });
  });
  
  
});
