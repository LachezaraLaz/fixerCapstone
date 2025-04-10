import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CreateIssue from '../createIssue';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { LanguageContext } from '../../../../context/LanguageContext';
import { I18n } from 'i18n-js';
import { en, fr } from '../../../../localization';

// code to run only this file through the terminal:
// npm run test ./src/screens/createIssue/__tests__/createIssueAiEnhancement.test.js
// or
// npm run test-coverage ./src/screens/createIssue/__tests__/createIssueAiEnhancement.test.js

// Mock Image Picker (not needed for AI tests but prevents errors)
jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
    launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true })),
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));
jest.mock('jwt-decode', () => jest.fn());
jest.mock('axios');
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

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

describe('CreateIssue Component - AI Enhancement', () => {
    let mockNavigation;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigation = { goBack: jest.fn() };

        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });
    });

    const setup = () => {
        const i18n = new I18n({ en, fr });
        i18n.locale = 'en'; // default language
      
        return render(
          <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
            <CreateIssue navigation={mockNavigation} />
          </LanguageContext.Provider>
        );
    };

    test('calls AI endpoint and shows suggestion on success', async () => {
        const mockImprovedText = "Improved job description text.";
        axios.post.mockResolvedValueOnce({
            data: { improvedDescription: mockImprovedText },
        });

        const { getByText, getByPlaceholderText, queryByText } = setup();
        const descriptionInput = getByPlaceholderText('Describe your service');

        await act(async () => {
            fireEvent.changeText(descriptionInput, 'Clogged faucet in need of a plumber.');
        });

        const aiButton = getByText('AI');

        await act(async () => {
            fireEvent.press(aiButton);
        });

        await waitFor(() => {
            expect(queryByText("AI's Suggestion:")).toBeTruthy();
            expect(queryByText(mockImprovedText)).toBeTruthy();
        });

        const acceptButton = getByText('Accept');
        await act(async () => {
            fireEvent.press(acceptButton);
        });

        expect(descriptionInput.props.value).toBe(mockImprovedText);
        expect(queryByText("AI's Suggestion:")).toBeNull();
    });

    test('displays error alert if AI returns 400 Invalid Category', async () => {
        axios.post.mockRejectedValueOnce({
          response: {
            status: 400,
            data: { error: 'Invalid job category. Please provide a home service or blue-collar job description.' },
          },
        });
      
        const { getByText, getByPlaceholderText, queryByText } = setup();
        const descriptionInput = getByPlaceholderText('Describe your service');
      
        await act(async () => {
          fireEvent.changeText(descriptionInput, 'Write me a Hello world in python');
        });
      
        const aiButton = getByText('AI');
      
        await act(async () => {
          fireEvent.press(aiButton);
        });
      
        await waitFor(() => {
          expect(getByText('Invalid Job Category: Invalid job category. Please provide a home service or blue-collar job description.')).toBeTruthy();
        });
    });
      

    test('displays generic error if AI call fails with status != 400', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
        // Mock API failure
        axios.post.mockRejectedValueOnce(new Error('Network error'));
    
        const { getByText, getByPlaceholderText } = setup();
        const descriptionInput = getByPlaceholderText('Describe your service');
    
        // Enter text
        await act(async () => {
            fireEvent.changeText(descriptionInput, 'Electric job needed.');
        });
    
        const aiButton = getByText('AI');
        await act(async () => {
            fireEvent.press(aiButton);
        });
    
        await waitFor(() => {
            expect(getByText('Error: Could not enhance your description. Please try again.')).toBeTruthy();
        });
    
        consoleErrorSpy.mockRestore();
    });
    

    test('rejecting the suggestion keeps original description', async () => {
        const mockImprovedText = "Better text from AI";
        axios.post.mockResolvedValueOnce({ data: { improvedDescription: mockImprovedText } });

        const { getByPlaceholderText, getByText, queryByText } = setup();
        const descriptionInput = getByPlaceholderText('Describe your service');

        await act(async () => {
            fireEvent.changeText(descriptionInput, 'Original user text');
        });

        const aiButton = getByText('AI');

        await act(async () => {
            fireEvent.press(aiButton);
        });

        await waitFor(() => {
            expect(queryByText("AI's Suggestion:")).toBeTruthy();
            expect(queryByText(mockImprovedText)).toBeTruthy();
        });

        const rejectButton = getByText('Reject');

        await act(async () => {
            fireEvent.press(rejectButton);
        });

        expect(descriptionInput.props.value).toBe('Original user text');
        expect(queryByText("AI's Suggestion:")).toBeNull();
    });

    test('displays alert if description is empty', async () => {
        const { getByText } = setup();
        const aiButton = getByText('AI');

        await act(async () => {
            fireEvent.press(aiButton);
        });

        expect(Alert.alert).toHaveBeenCalledWith('No text', 'Please enter some description first.');
    });
});
