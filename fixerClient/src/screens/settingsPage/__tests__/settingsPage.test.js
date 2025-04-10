import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsPage from '../settingsPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../../../../context/LanguageContext';
import { Alert, Animated } from 'react-native';
import { useChatContext } from '../../chat/chatContext';

// code to run only this file through the terminal:
// npm run test ./src/screens/settingsPage/__tests__/settingsPage.test.js
// or
// npm run test-coverage ./src/screens/settingsPage/__tests__/settingsPage.test.js

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../chat/chatContext', () => ({
  useChatContext: () => ({
    chatClient: { disconnectUser: jest.fn() },
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({}),
}));

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  canGoBack: () => true,
};

const renderWithContext = (overrideContext = {}) =>
  render(
    <LanguageContext.Provider
      value={{
        locale: 'en',
        setLocale: jest.fn(),
        changeLanguage: jest.fn(),
        ...overrideContext,
      }}
    >
      <SettingsPage navigation={mockNavigation} setIsLoggedIn={jest.fn()} />
    </LanguageContext.Provider>
  );

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders and navigates back', () => {
    const { getByTestId } = renderWithContext();
    fireEvent.press(getByTestId('settings-back-button'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });  

  test('navigates to AccountSettingsPage', () => {
    const { getByText } = renderWithContext();
    fireEvent.press(getByText('Edit Profile'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AccountSettingsPage');
  });

  test('shows feature unavailable alert (Privacy Policy)', () => {
    const { getByText } = renderWithContext();
    fireEvent.press(getByText('Privacy Policy'));
    // The actual alert is a modal. Check if message appears.
    expect(getByText('Coming Soon')).toBeTruthy();
    expect(getByText('Our privacy policy document will be available soon.')).toBeTruthy();
  });

  test('opens and changes language', async () => {
    const mockChangeLanguage = jest.fn();
    const { getByText } = renderWithContext({ changeLanguage: mockChangeLanguage });

    fireEvent.press(getByText('Language'));
    fireEvent.press(getByText('Français'));

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
    });
  });

  test('logs out successfully', async () => {
    const { getByText } = renderWithContext();
    const mockSetIsLoggedIn = jest.fn();

    const component = render(
      <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn(), changeLanguage: jest.fn() }}>
        <SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
      </LanguageContext.Provider>
    );

    fireEvent.press(component.getByText('Logout'));

    await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('streamToken');
        expect(mockSetIsLoggedIn).toHaveBeenCalledWith(false);
    }, { timeout: 2000 }); // Allow more time for logout animation + delay
      
  });

  test('shows alert on logout error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.removeItem.mockRejectedValue(new Error('Logout failed'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText } = renderWithContext();

    fireEvent.press(getByText('Logout'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'an error occurred while logging out');
    });

    errorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  test('shows alert when Terms & Conditions is pressed', () => {
    const { getByText } = renderWithContext();
  
    fireEvent.press(getByText('Terms and Conditions'));
  
    // These are values you set in showFeatureUnavailableAlert
    expect(getByText('Coming Soon')).toBeTruthy();
    expect(getByText('Our terms and conditions document will be available soon.')).toBeTruthy();
  });
  
});
