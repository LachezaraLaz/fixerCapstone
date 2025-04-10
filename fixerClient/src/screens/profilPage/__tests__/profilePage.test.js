import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfilePage from '../profilePage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../../../../context/LanguageContext';

// code to run only this file through the terminal:
// npm run test ./src/screens/profilPage/__tests__/profilePage.test.js
// or
// npm run test-coverage ./src/screens/profilPage/__tests__/profilePage.test.js

// Mocks
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: (cb) => cb(),
}));

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('mock-token')),
}));

const mockClient = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  idImageUrl: 'https://via.placeholder.com/150',
  street: '123 Main St',
  provinceOrState: 'Ontario',
  country: 'Canada',
  postalCode: 'A1A 1A1',
};

const renderWithContext = () =>
  render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn(), changeLanguage: jest.fn() }}>
      <ProfilePage navigation={{ navigate: mockNavigate }} setIsLoggedIn={jest.fn()} />
    </LanguageContext.Provider>
  );

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    const { getByText } = renderWithContext();
    expect(getByText('Loading...')).toBeTruthy();
  });

  test('displays client information after loading', async () => {
    axios.get.mockResolvedValueOnce({ data: mockClient });

    const { getByText, queryByText } = renderWithContext();

    await waitFor(() => {
      expect(queryByText('Loading...')).toBeNull();
      expect(getByText('Jane Doe')).toBeTruthy();
      expect(getByText('jane@example.com')).toBeTruthy();
      expect(getByText('123 Main St, Ontario, Canada, A1A 1A1')).toBeTruthy();
    });
  });

  test('navigates to SettingsPage when settings button is pressed', async () => {
    axios.get.mockResolvedValueOnce({ data: mockClient });
  
    const { getByTestId } = renderWithContext();
  
    const settingsButton = await waitFor(() => getByTestId('settings-button'));
  
    fireEvent.press(settingsButton);
  
    expect(mockNavigate).toHaveBeenCalledWith('SettingsPage');
  });
  
  test('navigates to ReportPage when report button is pressed', async () => {
    axios.get.mockResolvedValueOnce({ data: mockClient });

    const { getByText } = renderWithContext();

    await waitFor(() => {
      const reportBtn = getByText('Report a Professional');
      fireEvent.press(reportBtn);
      expect(mockNavigate).toHaveBeenCalledWith('ReportPage');
    });
  });

  test('shows error if client is null after fetch', async () => {
    axios.get.mockResolvedValueOnce({ data: null });

    const { getByText } = renderWithContext();

    await waitFor(() => {
      expect(getByText('Error loading profile.')).toBeTruthy();
    });
  });

  test('displays error if no token is found in AsyncStorage', async () => {
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    AsyncStorage.getItem.mockResolvedValueOnce(null); // No token
    axios.get.mockClear(); // No call should be made
  
    const { getByText, queryByText } = render(
      <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn(), changeLanguage: jest.fn() }}>
        <ProfilePage navigation={{ navigate: jest.fn() }} setIsLoggedIn={jest.fn()} />
      </LanguageContext.Provider>
    );
  
    await waitFor(() => {
      expect(queryByText('Loading...')).toBeNull();
      expect(getByText('Error loading profile.')).toBeTruthy();
      expect(mockConsoleError).toHaveBeenCalledWith('No token found');
    });
  
    mockConsoleError.mockRestore();
  });
  
  
  
});
