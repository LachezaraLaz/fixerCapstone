import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReportPage from '../reportPage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../../../../context/LanguageContext';
import { Alert } from 'react-native';
import { jwtDecode } from 'jwt-decode';

// code to run only this file through the terminal:
// npm run test ./src/screens/profilPage/__tests__/reportPage.test.js
// or
// npm run test-coverage ./src/screens/profilPage/__tests__/reportPage.test.js

jest.mock('axios');
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useFocusEffect: (cb) => cb(),
}));

// Mock DropdownField to simulate selection
jest.mock('../../../../components/dropdownField', () => {
    const React = require('react');
    const { useState } = React;
    const { View, Text, TouchableOpacity } = require('react-native');
  
    return ({ items, setValue }) => {
      const [showItems, setShowItems] = useState(false);
  
      return (
        <View>
          <TouchableOpacity
            onPress={() => setShowItems(true)}
            testID="dropdown-trigger"
          >
            <Text>Select an issue</Text>
          </TouchableOpacity>
  
          {showItems &&
            items.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setValue(item.value)}
                testID={`dropdown-item-${item.value}`}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            ))}
        </View>
      );
    };
  });
  
  

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };

const mockToken = 'mock-token';
const mockEmail = 'user@example.com';

const mockJobs = [
  {
    title: 'Fix Sink',
    professionalEmail: 'pro1@example.com',
  },
  {
    title: 'Paint Wall',
    professionalEmail: 'pro2@example.com',
  },
];

const renderWithContext = () =>
  render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn(), changeLanguage: jest.fn() }}>
      <ReportPage navigation={mockNavigation} />
    </LanguageContext.Provider>
  );

describe('ReportPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(mockToken);
    jwtDecode.mockReturnValue({ email: mockEmail });
  });

  test('navigates back on back button press', async () => {
    axios.get.mockResolvedValue({ data: { jobs: mockJobs } });

    const { getByTestId } = renderWithContext();

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test('loads jobs and populates dropdown items', async () => {
    axios.get.mockResolvedValue({ data: { jobs: mockJobs } });
  
    const { getByTestId, getByText } = renderWithContext();
  
    const dropdownTrigger = await waitFor(() => getByTestId('dropdown-trigger'));
    fireEvent.press(dropdownTrigger); // open the dropdown
  
    await waitFor(() => {
      expect(getByText('Fix Sink')).toBeTruthy();
      expect(getByText('Paint Wall')).toBeTruthy();
    });
  });

  test('updates professional name when issue is selected', async () => {
    axios.get.mockResolvedValue({ data: { jobs: mockJobs } });
  
    const { getByText, getByDisplayValue } = renderWithContext();
  
    // Wait for the dropdown placeholder
    const dropdownTrigger = await waitFor(() => getByText('Select an issue'));
  
    // Open the dropdown
    fireEvent.press(dropdownTrigger);
  
    // Now the options should appear
    const fixSinkOption = await waitFor(() => getByText('Fix Sink'));
  
    fireEvent.press(fixSinkOption);
  
    await waitFor(() => {
      expect(getByDisplayValue('pro1@example.com')).toBeTruthy();
    });
  });

  test('submits form and shows success alert', async () => {
    axios.get.mockResolvedValue({ data: { jobs: mockJobs } });
    axios.post.mockResolvedValue({ status: 200 });
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    jwtDecode.mockReturnValue({ email: mockEmail });
  
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  
    const { getByText, getByPlaceholderText, getByTestId } = renderWithContext();
  
    // Wait for and open dropdown
    const dropdownTrigger = await waitFor(() => getByTestId('dropdown-trigger'));
    fireEvent.press(dropdownTrigger);
  
    // Select a job
    const jobOption = await waitFor(() => getByText('Fix Sink'));
    fireEvent.press(jobOption);
  
    // Fill in the description field
    const descriptionInput = getByPlaceholderText('Describe the issue...');
    fireEvent.changeText(descriptionInput, 'Test description');
  
    // Submit
    fireEvent.press(getByText('Submit'));
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://fixercapstone-production.up.railway.app/send-email-report',
        expect.objectContaining({
          description: 'Test description',
          issue: 'Fix Sink',
          professionalName: 'pro1@example.com',
        }),
        expect.any(Object)
      );
  
      expect(alertSpy).toHaveBeenCalledWith(
        'Success',
        'Your report has been submitted',
        expect.any(Array),
        { cancelable: false }
      );
    });
  
    alertSpy.mockRestore();
  });
  

  test('shows error alert when required fields are missing', async () => {
    axios.get.mockResolvedValue({ data: { jobs: mockJobs } });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText } = renderWithContext();

    await waitFor(() => getByText('Submit'));
    fireEvent.press(getByText('Submit'));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please fill in all fields');

    alertSpy.mockRestore();
  });
});
