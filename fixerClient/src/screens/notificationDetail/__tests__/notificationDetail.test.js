import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationDetail from '../notificationDetail';
import { LanguageContext } from '../../../../context/LanguageContext';
import { I18n } from 'i18n-js';
import { en, fr } from '../../../../localization';
import { useNavigation } from '@react-navigation/native';

// code to run only this file through the terminal:
// npm run test ./src/screens/notificationDetail/__tests__/notificationDetail.test.js
// or
// npm run test-coverage ./src/screens/notificationDetail/__tests__/notificationDetail.test.js

// declare a local to hold the mock reference
let mockGoBack;

// Mock navigation
jest.mock('@react-navigation/native', () => {
  // define the mock inside the factory
  mockGoBack = jest.fn();
  return {
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

// Sample notification data
const mockNotification = {
  message: 'Your issue titled "Leaky Faucet" has been created successfully.',
  createdAt: '2024-05-01T15:30:00Z',
};

describe('NotificationDetail', () => {
  const setLocale = jest.fn();

  const renderComponent = (locale = 'en') => {
    return render(
      <LanguageContext.Provider value={{ locale, setLocale }}>
        <NotificationDetail route={{ params: { notification: mockNotification } }} />
      </LanguageContext.Provider>
    );
  };

  const renderComponentWithMessage = (message, locale = 'en') => {
    return render(
      <LanguageContext.Provider value={{ locale, setLocale: jest.fn() }}>
        <NotificationDetail route={{ params: { notification: { message, createdAt: '2024-05-01T15:30:00Z' } } }} />
      </LanguageContext.Provider>
    );
  };

  test('renders the translated title and message (EN)', () => {
    const { getByText } = renderComponent('en');
    const i18n = new I18n({ en, fr });
    i18n.locale = 'en';

    // Check title translation
    expect(getByText(i18n.t('notification_details'))).toBeTruthy();

    // Check message structure
    const start = i18n.t('your_issue_titled');
    const end = i18n.t('has_been_created');
    expect(getByText(`${start} "Leaky Faucet" ${end}`)).toBeTruthy();
  });

  test('renders the translated title and message (FR)', () => {
    const { getByText } = renderComponent('fr');
    const i18n = new I18n({ en, fr });
    i18n.locale = 'fr';

    const start = i18n.t('your_issue_titled');
    const end = i18n.t('has_been_created');

    expect(getByText(i18n.t('notification_details'))).toBeTruthy();
    expect(getByText(`${start} "Leaky Faucet" ${end}`)).toBeTruthy();
  });

  test('renders formatted date', () => {
    const { getByText } = renderComponent();
    expect(getByText(new Date(mockNotification.createdAt).toLocaleString())).toBeTruthy();
  });

  test('calls goBack when back button is pressed', () => {
    const { getByTestId } = renderComponent();
    fireEvent.press(getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  test('renders "has received a new quote" message correctly', () => {
    const message = 'Your issue titled "Test Job" has received a new quote.';
    const i18n = new I18n({ en, fr });
    i18n.locale = 'en';
  
    const { getByText } = renderComponentWithMessage(message);
    const start = i18n.t('your_issue_titled');
    const end = i18n.t('has_received_a_new_quote');
    expect(getByText(`${start} "Test Job" ${end}`)).toBeTruthy();
  });
  
  test('renders "has been accepted" message correctly', () => {
    const message = 'Your issue titled "Test Job" has been accepted. The job is now in progress.';
    const i18n = new I18n({ en, fr });
    i18n.locale = 'en';
  
    const { getByText } = renderComponentWithMessage(message);
    const start = i18n.t('your_issue_titled');
    const end = i18n.t('has_been_accepted');
    expect(getByText(`${start} "Test Job" ${end}`)).toBeTruthy();
  });
  
  test('renders "has been rejected" message correctly', () => {
    const message = 'Your issue titled "Test Job" has been rejected.';
    const i18n = new I18n({ en, fr });
    i18n.locale = 'en';
  
    const { getByText } = renderComponentWithMessage(message);
    const start = i18n.t('your_issue_titled');
    const end = i18n.t('has_been_rejected');
    expect(getByText(`${start} "Test Job" ${end}`)).toBeTruthy();
  });

  test('renders "Sorry" quote rejected message correctly', () => {
    const message = 'Sorry! Your quote for the job "Test Job" has been rejected.';
    const i18n = new I18n({ en, fr });
    i18n.locale = 'en';
  
    const { getByText } = renderComponentWithMessage(message);
    const start = i18n.t('your_quote_for_the_job_rejected');
    const end = 'has been rejected.'; // static part from your message
    expect(getByText(`${start} "Test Job" ${end}`)).toBeTruthy();
  });
});
