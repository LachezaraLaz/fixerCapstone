import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import EditIssue from '../editIssue';
import { LanguageContext } from '../../../../context/LanguageContext';
import { I18n } from 'i18n-js';
import { en, fr } from '../../../../localization';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// code to run only this file through the terminal:
// npm run test ./src/screens/editIssueAiEnhancement/__tests__/editIssueAiEnhancement.test.js
// or
// npm run test-coverage ./src/screens/editIssueAiEnhancement/__tests__/editIssueAiEnhancement.test.js

// Mocks
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn() }));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('jwt-decode', () => jest.fn(() => ({ email: 'user@example.com' })));
jest.mock('../../../../utils/geoCoding_utils', () => ({
  getAddressFromCoords: jest.fn(() => Promise.resolve('123 Main St, A1A 1A1')),
}));

jest.mock('../../../../components/customAlertError', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ visible, title, message }) => visible ? <Text>{`${title}: ${message}`}</Text> : null;
});

jest.mock('../../../../components/customAlertSuccess', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ visible, title }) => visible ? <Text>{title}</Text> : null;
});

// Helper render
const renderWithContext = (ui) =>
  render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
      {ui}
    </LanguageContext.Provider>
  );

const route = { params: { jobId: '123' } };
const mockNavigation = { goBack: jest.fn() };

describe('EditIssue - AI Enhancement', () => {
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

  test('shows AI suggestion on success and allows accept', async () => {
    const suggestion = 'Improved faucet description';
    axios.post.mockResolvedValueOnce({ data: { improvedDescription: suggestion } });

    const { getByText, getByDisplayValue, queryByText } = renderWithContext(
      <EditIssue navigation={mockNavigation} route={route} />
    );

    // Wait for job data to load
    await waitFor(() => expect(getByDisplayValue('Leaking faucet')).toBeTruthy());

    fireEvent.press(getByText('AI'));

    await waitFor(() => {
      expect(getByText("AI's Suggestion:")).toBeTruthy();
      expect(getByText(suggestion)).toBeTruthy();
    });

    fireEvent.press(getByText('Accept'));

    expect(queryByText("AI's Suggestion:")).toBeNull();
    expect(getByDisplayValue(suggestion)).toBeTruthy();
  });

  test('rejecting the AI suggestion retains original description', async () => {
    const suggestion = 'Refined plumbing description';
    axios.post.mockResolvedValueOnce({ data: { improvedDescription: suggestion } });

    const { getByText, getByDisplayValue, queryByText } = renderWithContext(
      <EditIssue navigation={mockNavigation} route={route} />
    );

    await waitFor(() => expect(getByDisplayValue('Leaking faucet')).toBeTruthy());
    fireEvent.press(getByText('AI'));

    await waitFor(() => {
      expect(getByText("AI's Suggestion:")).toBeTruthy();
      expect(getByText(suggestion)).toBeTruthy();
    });

    fireEvent.press(getByText('Reject'));

    expect(queryByText("AI's Suggestion:")).toBeNull();
    expect(getByDisplayValue('Leaking faucet')).toBeTruthy();
  });

  test('shows error alert if AI returns 400 Invalid Category', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Invalid category' },
      },
    });

    const { getByText } = renderWithContext(
      <EditIssue navigation={mockNavigation} route={route} />
    );

    await waitFor(() => fireEvent.press(getByText('AI')));

    await waitFor(() => {
      expect(getByText('Invalid Job Category: Invalid category')).toBeTruthy();
    });
  });

  test('shows generic error if AI call fails unexpectedly', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    const { getByText } = renderWithContext(
      <EditIssue navigation={mockNavigation} route={route} />
    );

    await waitFor(() => fireEvent.press(getByText('AI')));

    await waitFor(() => {
      expect(getByText('Error: Could not enhance your description. Please try again.')).toBeTruthy();
    });
  });
});
