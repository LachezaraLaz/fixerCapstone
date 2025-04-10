import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationPage from '../notificationPage';
import { LanguageContext } from '../../../../context/LanguageContext';
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {I18n} from "i18n-js";
import { en, fr } from '../../../../localization';

// code to run only this file through the terminal:
// npm run test ./src/screens/notificationPage/__tests__/notificationPage.test.js
// or
// npm run test-coverage ./src/screens/notificationPage/__tests__/notificationPage.test.js

jest.mock('axios');

// Declare mock outside
let mockNavigate;
let mockGoBack;

jest.mock('@react-navigation/native', () => {
  mockNavigate = jest.fn();
  mockGoBack = jest.fn();

  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

describe('NotificationPage', () => {
    const mockNotification = (message) => ({
      id: 'test-id',
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  
    const renderWithContext = (locale = 'en') =>
      render(
        <LanguageContext.Provider value={{ locale, setLocale: jest.fn() }}>
          <NavigationContainer>
            <NotificationPage />
          </NavigationContainer>
        </LanguageContext.Provider>
      );
  
    const renderWithMessage = (message, locale = 'en') => {
      // Inject mock notification for this test
      axios.get.mockResolvedValue({ data: [mockNotification(message)] });
      AsyncStorage.getItem.mockResolvedValue('mock-token');
  
      return render(
        <LanguageContext.Provider value={{ locale, setLocale: jest.fn() }}>
          <NavigationContainer>
            <NotificationPage />
          </NavigationContainer>
        </LanguageContext.Provider>
      );
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('renders "no notifications" when list is empty', async () => {
        axios.get.mockResolvedValue({ data: [] });
        AsyncStorage.getItem.mockResolvedValue('mock-token');

        const { getByText } = renderWithContext();

        await waitFor(() => {
        expect(getByText('No notifications available')).toBeTruthy();
        });
    });

    test('renders translated title and fetches notifications', async () => {
        const mockNotification = {
        id: '1',
        message: 'Your issue titled "Test Job" has been created successfully.',
        isRead: false,
        createdAt: new Date().toISOString(),
        };

        axios.get.mockResolvedValue({ data: [mockNotification] });
        AsyncStorage.getItem.mockResolvedValue('mock-token');

        const { getByText } = renderWithContext();

        await waitFor(() => {
        expect(getByText('Notifications')).toBeTruthy();
        expect(getByText(/Test Job/)).toBeTruthy();
        });
    });

    test('navigates to NotificationDetail on notification tap', async () => {
        const mockNotification = {
        id: '2',
        message: 'Your issue titled "Test Job" has been created successfully.',
        isRead: false,
        createdAt: new Date().toISOString(),
        };

        axios.get.mockResolvedValue({ data: [mockNotification] });
        AsyncStorage.getItem.mockResolvedValue('mock-token');

        const { getByText } = renderWithContext();
        const notif = await waitFor(() => getByText(/Test Job/));

        fireEvent.press(notif);
        expect(mockNavigate).toHaveBeenCalledWith('NotificationDetail', {
        notification: mockNotification,
        });
    });

    test('navigates to OldNotifications when button is pressed', async () => {
        const mockNotification = {
        id: '123',
        message: 'Your issue titled "Test Job" has been created successfully.',
        isRead: false,
        createdAt: new Date().toISOString(),
        };
    
        axios.get.mockResolvedValue({ data: [mockNotification] });
        AsyncStorage.getItem.mockResolvedValue('mock-token');
    
        const { getByText } = renderWithContext();
    
        const button = await waitFor(() => getByText('View Old Notifications'));
        fireEvent.press(button);
    
        expect(mockNavigate).toHaveBeenCalledWith('OldNotifications', expect.anything());
    });

    test('calls goBack when back button is pressed', async () => {
        const mockNotification = {
        id: 'back-id',
        message: 'Your issue titled "Back Test" has been created successfully.',
        isRead: false,
        createdAt: new Date().toISOString(),
        };
    
        axios.get.mockResolvedValue({ data: [mockNotification] });
        AsyncStorage.getItem.mockResolvedValue('mock-token');
    
        const { getByTestId } = renderWithContext();
    
        // Give time for data to load
        await waitFor(() => getByTestId('go-back-button'));
    
        fireEvent.press(getByTestId('go-back-button'));
        expect(mockGoBack).toHaveBeenCalled();
    });
  
    test('parses message and renders localized notification correctly', async () => {
        const mockNotification = {
        id: '123',
        message: 'Congrats! Your quote for the job "Test Job" has been accepted. The job is now in progress.',
        isRead: false,
        createdAt: new Date().toISOString(),
        };
    
        axios.get.mockResolvedValue({ data: [mockNotification] });
        AsyncStorage.getItem.mockResolvedValue('mock-token');
    
        const { getByText } = renderWithContext();
    
        await waitFor(() => {
        expect(getByText('🎉 Congrats! Your quote for the job titled "Test Job" has been accepted. The job is now in progress.')).toBeTruthy();
        });
    });
  
    test('renders "Your issue has been created" message correctly', async () => {
        const message = 'Your issue titled "Test Job" has been created successfully.';
        const i18n = new I18n({ en, fr });
        i18n.locale = 'en';
      
        const { getByText } = renderWithMessage(message);
      
        const expected = `${i18n.t('your_issue_titled')} "Test Job" ${i18n.t('has_been_created')}`;
        await waitFor(() => {
          expect(getByText(expected)).toBeTruthy();
        });
    });
    
    test('renders "Your issue has received a new quote" message correctly', async () => {
        const message = 'Your issue titled "Test Job" has received a new quote.';
        const i18n = new I18n({ en, fr });
        i18n.locale = 'en';
      
        const { getByText } = renderWithMessage(message);
        const expected = `${i18n.t('your_issue_titled')} "Test Job" ${i18n.t('has_received_a_new_quote')}`;
      
        await waitFor(() => {
          expect(getByText(expected)).toBeTruthy();
        });
    });
      
    test('renders "Your issue has been accepted" message correctly', async () => {
        const message = 'Your issue titled "Test Job" has been accepted. The job is now in progress.';
        const i18n = new I18n({ en, fr });
        i18n.locale = 'en';
      
        const { getByText } = renderWithMessage(message);
        const expected = `${i18n.t('your_issue_titled')} "Test Job" ${i18n.t('has_been_accepted')}`;
      
        await waitFor(() => {
          expect(getByText(expected)).toBeTruthy();
        });
    });
      
    test('renders "Your issue has been rejected" message correctly', async () => {
        const message = 'Your issue titled "Test Job" has been rejected.';
        const i18n = new I18n({ en, fr });
        i18n.locale = 'en';
      
        const { getByText } = renderWithMessage(message);
        const expected = `${i18n.t('your_issue_titled')} "Test Job" ${i18n.t('has_been_rejected')}`;
      
        await waitFor(() => {
          expect(getByText(expected)).toBeTruthy();
        });
    });
      
    test('renders "Congrats! quote accepted" message correctly', async () => {
        const message = 'Congrats! Your quote for the job "Test Job" has been accepted. The job is now in progress.';
        const i18n = new I18n({ en, fr });
        i18n.locale = 'en';
      
        const { getByText } = renderWithMessage(message);
        const expected = `${i18n.t('your_quote_for_the_job_accepted')} "Test Job" ${i18n.t('has_been_accepted')}`;
      
        await waitFor(() => {
          expect(getByText(expected)).toBeTruthy();
        });
    });
      
    test('renders "Sorry! quote rejected" message correctly', async () => {
        const message = 'Sorry! Your quote for the job "Test Job" has been rejected.';
        const i18n = new I18n({ en, fr });
        i18n.locale = 'en';
      
        const { getByText } = renderWithMessage(message);
        const expected = `${i18n.t('your_quote_for_the_job_rejected')} "Test Job" ${i18n.t('has_been_rejected')}`;
      
        await waitFor(() => {
          expect(getByText(expected)).toBeTruthy();
        });
    });

    test('logs error when notification fetch fails', async () => {
        const error = new Error('Network failure');
        axios.get.mockRejectedValue(error);
        AsyncStorage.getItem.mockResolvedValue('mock-token');
      
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
        renderWithContext();
      
        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith(
            'Error fetching notifications:',
            'Network failure'
          );
        });
      
        consoleSpy.mockRestore();
    });
});
