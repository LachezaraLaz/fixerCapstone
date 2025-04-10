import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OldNotifications from '../oldNotifications';
import { LanguageContext } from '../../../../context/LanguageContext';
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {I18n} from "i18n-js";
import { en, fr } from '../../../../localization';

// code to run only this file through the terminal:
// npm run test ./src/screens/oldNotifications/__tests__/oldNotifications.test.js
// or
// npm run test-coverage ./src/screens/oldNotifications/__tests__/oldNotifications.test.js

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
  }));
  
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

let mockRouteParams = {
  oldNotifications: [
    {
      id: 'notif123',
      message: 'Your issue titled "Broken Sink" has been created successfully.',
      createdAt: new Date().toISOString(),
      isRead: true,
    },
  ],
};

// Mock react-navigation BEFORE imports
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

jest.mock('axios', () => ({
  patch: jest.fn(() => Promise.resolve({ status: 200 })),
}));

describe('OldNotifications', () => {
  const renderComponent = () =>
    render(
      <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
        <OldNotifications />
      </LanguageContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders title and notification correctly', () => {
    mockRouteParams = {
      oldNotifications: [
        {
          id: 'notif123',
          message: 'Your issue titled "Broken Sink" has been created successfully.',
          createdAt: new Date().toISOString(),
          isRead: true,
        },
      ],
    };

    const { getByText } = renderComponent();
    expect(getByText('Old Notifications')).toBeTruthy();
    expect(getByText('🎉 Congrats! Your issue titled "Broken Sink" has been created successfully.')).toBeTruthy();
  });

  test('pressing back button calls navigation.goBack', () => {
    const { getByTestId } = renderComponent();

    fireEvent.press(getByTestId('old-notifs-back-button'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  test('renders accepted quote notification', () => {
    mockRouteParams.oldNotifications = [
      {
        id: 'notif1',
        message: 'Congrats! Your issue titled "Shower Leak" has been accepted. The job is now in progress.',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
    ];
  
    const { getByText } = renderComponent();
  
    expect(
      getByText('🎉 Congrats! Your issue titled "Shower Leak" has been accepted. The job is now in progress.')
    ).toBeTruthy();
  });

  test('renders rejected quote notification', () => {
    mockRouteParams.oldNotifications = [
      {
        id: 'notif2',
        message: 'Sorry! "Paint Job" has been rejected.',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
    ];
  
    const { getByText } = renderComponent();
  
    expect(
      getByText('🔴 Sorry! Your quote for the job titled "Paint Job" has been rejected.')
    ).toBeTruthy();
  });
  
  
  test('renders new quote received notification', () => {
    mockRouteParams.oldNotifications = [
      {
        id: 'notif3',
        message: 'Your issue titled "Garage Fix" has received a new quote.',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
    ];
  
    const { getByText } = renderComponent();
  
    expect(
      getByText('🎉 Congrats! Your issue titled "Garage Fix" has received a new quote.')
    ).toBeTruthy();
  });
  
  test('renders created issue notification', () => {
    mockRouteParams.oldNotifications = [
      {
        id: 'notif4',
        message: 'Your issue titled "Basement Flood" has been created successfully.',
        createdAt: new Date().toISOString(),
        isRead: true,
      },
    ];
  
    const { getByText } = renderComponent();
  
    expect(
      getByText('🎉 Congrats! Your issue titled "Basement Flood" has been created successfully.')
    ).toBeTruthy();
  });
  
  test('navigates to NotificationDetail on notification tap', async () => {
    const mockNotification = {
      id: 'notif10',
      message: 'Congrats! Your issue titled "Leaky Pipe" has been accepted. The job is now in progress.',
      createdAt: new Date().toISOString(),
      isRead: true,
    };
  
    mockRouteParams.oldNotifications = [mockNotification];
  
    const { getByText } = renderComponent();
  
    const notif = await waitFor(() =>
      getByText('🎉 Congrats! Your issue titled "Leaky Pipe" has been accepted. The job is now in progress.')
    );
  
    fireEvent.press(notif);
  
    expect(mockNavigate).toHaveBeenCalledWith('NotificationDetail', {
      notification: mockNotification,
    });
  });
});
