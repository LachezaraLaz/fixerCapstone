import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import EditIssue from '../editIssue';
import { LanguageContext } from '../../../../context/LanguageContext';
import { I18n } from 'i18n-js';
import { en, fr } from '../../../../localization';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// code to run only this file through the terminal:
// npm run test ./src/screens/editIssue/__tests__/editIssue.test.js
// or
// npm run test-coverage ./src/screens/editIssue/__tests__/editIssue.test.js

// Mocking
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: 'fake-uri' }] }),
}));
jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(() => ({ email: 'user@example.com' })),
}));  
jest.mock('../../../../utils/geoCoding_utils', () => ({
  getAddressFromCoords: jest.fn(() => Promise.resolve('123 Default St, A1B 2C3')),
}));

// Alerts
jest.mock('../../../../components/customAlertError', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ visible, title, message }) => visible ? <Text>{`${title}: ${message}`}</Text> : null;
});
jest.mock('../../../../components/customAlertSuccess', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return ({ visible, title, message }) =>
      visible ? <Text>{title}: {message}</Text> : null;
});
  

// ProfessionalSelector and DropdownField simplified
jest.mock('../../../../components/searchAndSelectTagField', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return ({ selectedProfessionals, setSelectedProfessionals }) => (
    <TextInput
      placeholder="Professional"
      value={selectedProfessionals[0] || ''}
      onChangeText={(text) => setSelectedProfessionals([text])}
    />
  );
});
jest.mock('../../../../components/dropdownField', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return ({ setValue }) => (
    <TouchableOpacity onPress={() => setValue('low-priority')}>
      <Text>Select Timeline</Text>
    </TouchableOpacity>
  );
});

const renderWithContext = (ui) => (
  render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
      {ui}
    </LanguageContext.Provider>
  )
);

describe('EditIssue', () => {
  const mockNavigation = { goBack: jest.fn() };
  const route = { params: { jobId: '123' } };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        title: 'Fix sink',
        description: 'Leaking faucet',
        professionalNeeded: 'Plumber',
        imageUrl: '',
        timeline: 'low-priority',
        longitude: -75,
        latitude: 45,
      },
    });
  });

  test('renders title and description fields', async () => {
    const { getByPlaceholderText } = renderWithContext(<EditIssue navigation={mockNavigation} route={route} />);
    await waitFor(() => {
      expect(getByPlaceholderText('Title')).toBeTruthy();
      expect(getByPlaceholderText('Describe your service')).toBeTruthy();
    });
  });

  test('navigates back on back button press', async () => {
    const { getByTestId } = renderWithContext(<EditIssue navigation={mockNavigation} route={route} />);
    await waitFor(() => fireEvent.press(getByTestId('back-button')));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test('displays image picker when upload box is pressed', async () => {
    const { getByText, getAllByText } = renderWithContext(<EditIssue navigation={mockNavigation} route={route} />);
    await waitFor(() => fireEvent.press(getByText('Take from your gallery')));
    await waitFor(() => {
      expect(getAllByText('✖')[0]).toBeTruthy();
    });
  });

  test('shows address error on failed address verification', async () => {
    axios.post.mockRejectedValueOnce(new Error('Verification error'));

    const { getByText, getByPlaceholderText } = renderWithContext(<EditIssue navigation={mockNavigation} route={route} />);
    await waitFor(() => fireEvent.press(getByText('Enter New Location')));

    fireEvent.changeText(getByPlaceholderText('Street Address'), 'Fake St');
    fireEvent.changeText(getByPlaceholderText('Postal Code'), 'X1X1X1');
    fireEvent.press(getByText('Verify Address'));

    await waitFor(() => {
      expect(getByText(/Address Error/)).toBeTruthy();
    });
  });

  test('shows success message after valid update', async () => {
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        title: 'Fix sink',
        description: 'Leaking faucet',
        professionalNeeded: 'Plumber',
        imageUrl: '',
        timeline: 'low-priority',
        longitude: -75,
        latitude: 45,
      },
    });
  
    axios.put.mockResolvedValueOnce({
      status: 200,
      data: { message: 'Updated!' },
    });
  
    axios.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        coordinates: { latitude: 45, longitude: -75 },
        isAddressValid: true,
      },
    });
  
    const { getByPlaceholderText, getByDisplayValue, getByText, getByTestId } = renderWithContext(
      <EditIssue navigation={mockNavigation} route={route} />
    );
  
    // Wait for initial values to appear
    await waitFor(() => expect(getByDisplayValue('Fix sink')).toBeTruthy());
  
    fireEvent.changeText(getByDisplayValue('Fix sink'), 'Updated Title');
    fireEvent.changeText(getByDisplayValue('Leaking faucet'), 'Updated description');
    fireEvent.changeText(getByPlaceholderText('Professional'), 'Electrician');
    fireEvent.press(getByText('Select Timeline'));
  
    fireEvent.press(getByText('Enter New Location'));
    fireEvent.changeText(getByPlaceholderText('Street Address'), '123 Fake St');
    fireEvent.changeText(getByPlaceholderText('Postal Code'), 'A1A 1A1');
    fireEvent.press(getByText('Verify Address'));
  
    await waitFor(() => {
      expect(getByText('✅ Valid Address entered')).toBeTruthy();
    });
  
    fireEvent.press(getByTestId('modify-job-button'));

    await waitFor(() => {
        expect(axios.put).toHaveBeenCalled(); // Make sure your mock was even hit
    });
  
    await waitFor(() => {
      expect(getByText(/Job modified successfully/i)).toBeTruthy();
    });
  });
  
  
});
