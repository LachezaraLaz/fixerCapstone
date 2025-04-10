import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import axios from 'axios';
import SignUpPage from '../signupPage'; // Adjust the path accordingly
import { getByTestId } from '@testing-library/dom';
import { LanguageContext } from '../../../../context/LanguageContext';
import { I18n } from 'i18n-js';
import { en, fr } from '../../../../localization';

// code to run only this file through the terminal:
// npm run test ./src/screens/signup/__tests__/signup.test.js
// or
// npm run test-coverage ./src/screens/signup/__tests__/signup.test.js

const i18n = new I18n({ en, fr });
i18n.locale = 'en'; 
i18n.enableFallback = true;

jest.mock('axios');
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
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

jest.mock('../../../../components/customAlertError', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      __esModule: true,
      default: ({ visible, message }) =>
        visible ? <Text>{message}</Text> : null,
    };
});
  
jest.mock('../../../../components/customAlertSuccess', () => ({
  __esModule: true,
  default: (props) => {
    const React = require('react');
    const { Text } = require('react-native');
    return props.visible ? (
      <>
        <Text>{props.message}</Text>
        <Text testID="success-alert-close" onPress={props.onClose}>Close</Text>
      </>
    ) : null;
  },
}));
  

// Mock navigation object
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
};

const renderWithContext = (ui, locale = 'en') => {
    return render(
      <LanguageContext.Provider value={{ locale, setLocale: jest.fn() }}>
        {ui}
      </LanguageContext.Provider>
    );
  };
  

describe('SignUpPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly', () => {
        const { getByText, getByPlaceholderText } = renderWithContext(<SignUpPage navigation={mockNavigation} />);

        // Check if the title and input fields are rendered
        expect(getByText('Sign Up')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    })

    test('shows password validation feedback', () => {
        const { getByPlaceholderText, getByText } = renderWithContext(<SignUpPage navigation={mockNavigation} />);
        const passwordInput = getByPlaceholderText('Password');
        fireEvent.changeText(passwordInput, 'weak');
        expect(getByText('• At least 8 characters')).toBeTruthy();
        expect(getByText('• At least one number')).toBeTruthy();
        expect(getByText('✓ At least one lowercase letter')).toBeTruthy();
        expect(getByText('• At least one special character')).toBeTruthy();
    });

    test('displays error for invalid email on Next', async () => {
        const { getByPlaceholderText, getByText, queryByText } = renderWithContext(<SignUpPage navigation={mockNavigation} />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'bademail');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1!');
        fireEvent.press(getByText('Next'));
    
        await waitFor(() => {
          expect(queryByText('Please enter a valid email and matching passwords')).toBeTruthy();
        });
    });

    test('displays error for mismatched passwords', async () => {
        const { getByPlaceholderText, getByText, queryByText } = renderWithContext(<SignUpPage navigation={mockNavigation} />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'valid@email.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Different1!');
        fireEvent.press(getByText('Next'));
    
        await waitFor(() => {
          expect(queryByText('Please enter a valid email and matching passwords')).toBeTruthy();
        });
    });

    test('shows name/address fields after valid email/password and Next', () => {
        const { getByPlaceholderText, getByText } = renderWithContext(<SignUpPage navigation={mockNavigation} />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1!');
        fireEvent.press(getByText('Next'));
    
        expect(getByPlaceholderText('First Name')).toBeTruthy();
        expect(getByPlaceholderText('Last Name')).toBeTruthy();
        expect(getByPlaceholderText('Street Address')).toBeTruthy();
        expect(getByPlaceholderText('Postal Code')).toBeTruthy();
    });

    test('validates password input', () => {
        const { getByPlaceholderText, getByText } = renderWithContext(<SignUpPage navigation={mockNavigation} />);

        const passwordInput = getByPlaceholderText('Password');

        // Test invalid password
        fireEvent.changeText(passwordInput, 'weak');
        expect(getByText('• At least 8 characters')).toBeTruthy();
        expect(getByText('• At least one number')).toBeTruthy();
        expect(getByText('• At least one uppercase letter')).toBeTruthy();
        expect(getByText('✓ At least one lowercase letter')).toBeTruthy();
        expect(getByText('• At least one special character')).toBeTruthy();

        // Test valid password
        fireEvent.changeText(passwordInput, 'StrongPass1!');
        expect(getByText('✓ At least 8 characters')).toBeTruthy();
        expect(getByText('✓ At least one number')).toBeTruthy();
        expect(getByText('✓ At least one uppercase letter')).toBeTruthy();
        expect(getByText('✓ At least one lowercase letter')).toBeTruthy();
        expect(getByText('✓ At least one special character')).toBeTruthy();
    });

    test('displays error if address verification fails', async () => {
        axios.post.mockRejectedValueOnce({
          response: { data: { message: 'Invalid address' } },
        });
    
        const { getByPlaceholderText, getByText } = renderWithContext(<SignUpPage navigation={mockNavigation} />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'valid@email.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1!');
        fireEvent.press(getByText('Next'));
    
        fireEvent.changeText(getByPlaceholderText('Street Address'), '123 Fake Street');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), 'A1B 2C3');
        fireEvent.press(getByText('Verify Address'));
    
        await waitFor(() => {
          expect(getByText('Invalid address')).toBeTruthy();
        });
    });

    test('successfully verifies address and enables sign-up', async () => {
        axios.post.mockResolvedValueOnce({
          data: {
            isAddressValid: true,
            coordinates: { latitude: 45.0, longitude: -75.0 },
          },
        });
    
        const { getByPlaceholderText, getByText, getByTestId } = renderWithContext(<SignUpPage navigation={mockNavigation} />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'valid@email.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password1!');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'Password1!');
        fireEvent.press(getByText('Next'));
    
        fireEvent.changeText(getByPlaceholderText('Street Address'), '123 Main St');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), 'A1B 2C3');
        fireEvent.press(getByText('Verify Address'));
    
        await waitFor(() => {
          expect(getByText('Valid Address entered')).toBeTruthy();
        });
    
        fireEvent.press(getByTestId('sign-up-button'));
    
        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            'https://fixercapstone-production.up.railway.app/client/verifyAddress',
            {
              street: '123 Main St',
              postalCode: 'A1B 2C3',
            }
          );
        });
    });

});