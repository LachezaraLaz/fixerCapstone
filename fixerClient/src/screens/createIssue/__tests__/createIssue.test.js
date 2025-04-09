import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CreateIssue from '../createIssue';
import { LanguageContext } from '../../../../context/LanguageContext';
import { I18n } from 'i18n-js';
import { en, fr } from '../../../../localization';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// code to run only this file through the terminal:
// npm run test ./src/screens/createIssue/__tests__/createIssue.test.js
// or
// npm run test-coverage ./src/screens/createIssue/__tests__/createIssue.test.js

// Mock external libs
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
}));
jest.mock('jwt-decode', () => ({
    jwtDecode: () => ({ email: 'user@example.com' }),
}));

// Mock alert components
jest.mock('../../../../components/customAlertError', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      __esModule: true,
      default: ({ visible, title, message }) =>
        visible ? (
          <Text>{`${title}: ${message}`}</Text>
        ) : null,
    };
});

jest.mock('../../../../components/customAlertSuccess', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ visible, title, message }) =>
      visible ? <Text>{title}: {message}</Text> : null,
  };
});

// Mock ProfessionalSelector to allow input
jest.mock('../../../../components/searchAndSelectTagField', () => {
    const React = require('react');
    const { View, TextInput } = require('react-native');
    return ({ selectedProfessionals, setSelectedProfessionals }) => (
      <View>
        <TextInput
          placeholder="Type a professional (e.g. Plumber)"
          value={selectedProfessionals[0] || ''}
          onChangeText={(text) => setSelectedProfessionals([text])}
        />
      </View>
    );
});

// Mock DropdownField
jest.mock('../../../../components/dropdownField', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return ({ setValue }) => (
      <TouchableOpacity onPress={() => setValue('low-priority')}>
        <Text>Select Timeline</Text>
      </TouchableOpacity>
    );
 });
  
const mockNavigation = {
    goBack: jest.fn(),
};
  

// Utility render function with context
const renderWithContext = (component) => {
    return render(
      <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
        {component}
      </LanguageContext.Provider>
    );
};

const i18n = new I18n({ en, fr });
i18n.locale = 'en';

describe('CreateIssue', () => {
    const mockNavigation = { goBack: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        AsyncStorage.getItem.mockResolvedValue('mock-token');
    });

    test('renders essential input fields', () => {
        const { getAllByText, getByPlaceholderText } = renderWithContext(<CreateIssue navigation={mockNavigation} />);
        expect(getAllByText(i18n.t('create_job')).length).toBeGreaterThanOrEqual(1);
        expect(getByPlaceholderText(i18n.t('title'))).toBeTruthy();
        expect(getByPlaceholderText(i18n.t('describe_your_service'))).toBeTruthy();
    });

    test('shows address error on address verification failure', async () => {
        axios.post.mockRejectedValueOnce(new Error('Verification Failed'));

        const { getByText, getByPlaceholderText } = renderWithContext(<CreateIssue navigation={mockNavigation} />);
        
        // Switch to custom location
        fireEvent.press(getByText(i18n.t('enter_new_address')));

        fireEvent.changeText(getByPlaceholderText(i18n.t('street_address')), '123 Maple St');
        fireEvent.changeText(getByPlaceholderText(i18n.t('postal_code')), 'A1B2C3');
        fireEvent.press(getByText(i18n.t('verify_address')));

        await waitFor(() => {
            expect(getByText('Address Error: Could not verify the address. Please double-check your info.')).toBeTruthy();
        });      
    });

    test('navigates back when back button is pressed', () => {
        const { getByTestId } = renderWithContext(<CreateIssue navigation={mockNavigation} />);
        fireEvent.press(getByTestId('back-button'));
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    test('fills all required fields and enables submit', async () => {
        const { getByPlaceholderText, getByText, getByTestId } = renderWithContext(
          <CreateIssue navigation={mockNavigation} />
        );
      
        // Fill title
        fireEvent.changeText(getByPlaceholderText('Title'), 'Leaky faucet');
      
        // Fill description
        fireEvent.changeText(getByPlaceholderText('Describe your service'), 'Fix leaking kitchen faucet');
      
        // Select professional
        fireEvent.changeText(getByPlaceholderText('Type a professional (e.g. Plumber)'), 'Plumber');
      
        // Select timeline
        fireEvent.press(getByText('Select Timeline'));
      
        // Enter new location
        fireEvent.press(getByText('Enter New Location'));
        fireEvent.changeText(getByPlaceholderText('Street Address'), '123 Maple St');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), 'A1B 2C3');
      
        // Mock valid address result
        const axios = require('axios');
        axios.post.mockResolvedValueOnce({
          data: {
            coordinates: { latitude: 45, longitude: -75 },
            isAddressValid: true,
          },
        });
      
        // Press "Verify Address"
        fireEvent.press(getByText('Verify Address'));
      
        await waitFor(() => {
          expect(getByText('✅ Valid Address entered')).toBeTruthy();
        });
      
        // Submit should now be enabled
        const submitButton = getByTestId('post-job-button');
        expect(submitButton.props.accessibilityState?.disabled).toBe(false);
    });

    test('should allow picking an image and display it', async () => {
        const mockImageUri = 'file://some/fake/image.jpg';
    
        // Mock successful image selection
        const mockLaunchImageLibraryAsync = require('expo-image-picker').launchImageLibraryAsync;
        mockLaunchImageLibraryAsync.mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: mockImageUri }]
        });
    
        const { getByText, getAllByText } = renderWithContext(<CreateIssue navigation={{ goBack: jest.fn() }} />);

        // Tap "Take from your gallery"
        await act(async () => {
            fireEvent.press(getByText('Take from your gallery'));
        });
    
        // Wait for image preview to appear
        await waitFor(() => {
            expect(getAllByText('✖')[0]).toBeTruthy(); // Remove button
        });
    });

    test('should remove the selected image when ✖ button is pressed', async () => {
        const mockImageUri = 'file://some/fake/image.jpg';
      
        // Mock successful image selection
        const mockLaunchImageLibraryAsync = require('expo-image-picker').launchImageLibraryAsync;
        mockLaunchImageLibraryAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: mockImageUri }]
        });
      
        const { getByText, queryByText, getAllByText } = renderWithContext(<CreateIssue navigation={{ goBack: jest.fn() }} />);
      
        // Trigger image selection
        await act(async () => {
          fireEvent.press(getByText('Take from your gallery'));
        });
      
        // Expect remove button to be visible
        await waitFor(() => {
          expect(getAllByText('✖')[0]).toBeTruthy();
        });
      
        // Tap remove button (✖)
        await act(async () => {
          fireEvent.press(getAllByText('✖')[0]);
        });
      
        // Confirm image preview is gone (✖ button should not be in the DOM anymore)
        await waitFor(() => {
          expect(queryByText('✖')).toBeNull();
        });
    });

    test('displays success alert after successful job posting', async () => {
        const mockSuccessResponse = {
          status: 201,
          data: {},
        };
      
        // Mock verifyAddress and postIssue
        axios.post
          .mockResolvedValueOnce({
            data: {
              coordinates: { latitude: 45, longitude: -75 },
              isAddressValid: true,
            },
          }) // verifyAddress
          .mockResolvedValueOnce(mockSuccessResponse); // postIssue
      
        const { getByText, getByPlaceholderText, getByTestId } = renderWithContext(
          <CreateIssue navigation={mockNavigation} />
        );
      
        // Fill out the form
        fireEvent.changeText(getByPlaceholderText('Title'), 'Fix sink');
        fireEvent.changeText(getByPlaceholderText('Describe your service'), 'Leaking under kitchen sink');
        fireEvent.changeText(getByPlaceholderText('Type a professional (e.g. Plumber)'), 'Plumber');
        fireEvent.press(getByText('Select Timeline'));
      
        // Switch to "Enter New Location" and fill in address
        fireEvent.press(getByText('Enter New Location'));
        fireEvent.changeText(getByPlaceholderText('Street Address'), '123 Maple St');
        fireEvent.changeText(getByPlaceholderText('Postal Code'), 'A1B 2C3');
      
        // Verify address
        fireEvent.press(getByText('Verify Address'));
      
        await waitFor(() => {
          expect(getByText('✅ Valid Address entered')).toBeTruthy();
        });
      
        // Submit job
        fireEvent.press(getByTestId('post-job-button'));
      
        await waitFor(() => {
          expect(getByText(`${i18n.t('job_posted_successfully')}: ${i18n.t('your_job_has_been_posted')}`)).toBeTruthy();
        });
    });
      
      
    
});
