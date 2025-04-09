import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyIssuesPosted from '../myIssuesPosted';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { LanguageContext } from '../../../../context/LanguageContext'; 
import { NavigationContainer } from '@react-navigation/native';

// code to run only this file through the terminal:
// npm run test ./src/screens/myIssuesPosted/__tests__/issuesPosted.test.js
// or
// npm run test-coverage ./src/screens/myIssuesPosted/__tests__/issuesPosted.test.js

// Mocking dependencies
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
    useIsFocused: jest.fn(),
  };
});
jest.mock('axios', () => ({
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({ email: 'user@example.com' })),
}));
jest.spyOn(Alert, 'alert');

describe('MyIssuesPosted Component', () => {
  let useNavigationMock;
  let useIsFocusedMock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Access the mocks for useNavigation & useIsFocused
    const navigationNative = require('@react-navigation/native');
    useNavigationMock = navigationNative.useNavigation;
    useIsFocusedMock = navigationNative.useIsFocused;

    // Provide default mockReturnValues so the component doesn't crash
    useNavigationMock.mockReturnValue({
      navigate: jest.fn(),
    });
    useIsFocusedMock.mockReturnValue(true);
  });

  const renderWithContext = (ui) => {
    return render(
      <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
        <NavigationContainer>
          {ui}
        </NavigationContainer>
      </LanguageContext.Provider>
    );
  };

  test('displays jobs after fetching data', async () => {
    const mockJobs = [
      {
        _id: '1',
        title: 'Fix Light Bulb',
        status: 'open',  // Status is 'open'
        professionalNeeded: 'Electrician',
        description: 'The living room light needs to be fixed.',
        imageUrl: 'http://example.com/image.jpg',
        price: 50,
      },
    ];
  
    // Mocking the necessary async storage and axios request
    AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
    axios.get.mockResolvedValueOnce({ status: 200, data: { jobs: mockJobs } });
  
    const { getByText } = renderWithContext(<MyIssuesPosted />);
  
    // Wait for the job data to be fetched and rendered
    await waitFor(() => {
      expect(getByText('Fix Light Bulb')).toBeTruthy();
      expect(getByText('📍 Electrician')).toBeTruthy();
      expect(getByText('$50')).toBeTruthy();
    });
  });
  

  test('displays an alert when there are no jobs posted', async () => {
    AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
    axios.get.mockResolvedValueOnce({ status: 200, data: { jobs: [] } });

    const { getByText } = renderWithContext(<MyIssuesPosted />);

    await waitFor(() => {
      expect(getByText('No jobs available')).toBeTruthy();
    });
  });
});
