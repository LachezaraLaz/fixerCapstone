import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../homeScreen';
import { LanguageContext } from '../../../../context/LanguageContext';
import { en, fr } from '../../../../localization';
import { I18n } from 'i18n-js';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native'; // correct import!

// code to run only this file through the terminal:
// npm run test ./src/screens/homeScreen/__tests__/homeScreen.test.js
// or
// npm run test-coverage ./src/screens/homeScreen/__tests__/homeScreen.test.js

// Mocks
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('../../../../components/notificationButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ onPress }) => (
    <TouchableOpacity testID="notification-button" onPress={onPress}>
      <Text>Notif</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../../../components/searchBar', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return ({ onSearchChange }) => (
    <TextInput placeholder="Search" onChangeText={onSearchChange} />
  );
});

jest.mock('../../../../components/orangeButton', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return ({ title, onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../chat/chatContext', () => ({
  useChatContext: () => ({ chatClient: {} }),
}));

const renderWithContext = (ui) => {
    return render(
      <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
        <NavigationContainer>
          {ui}
        </NavigationContainer>
      </LanguageContext.Provider>
    );
  };
  

describe('HomeScreen', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('mock-token');
  
    // Global alert mock
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });
  

  afterEach(() => {
    jest.restoreAllMocks(); // resets Alert, axios mocks, etc.
  });
  

  test('renders greeting and search bar', async () => {
    axios.get.mockResolvedValueOnce({ data: { firstName: 'John' } }); // profile
    axios.get.mockResolvedValueOnce({ data: [] }); // quotes
    axios.get.mockResolvedValueOnce({ data: [] }); // notifications

    const { getByText, getByPlaceholderText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );

    await waitFor(() => {
      expect(getByText('Hi John!')).toBeTruthy();
      expect(getByPlaceholderText('Search')).toBeTruthy();
    });
  });

  test('navigates to CreateIssue screen on button press', async () => {
    axios.get.mockResolvedValueOnce({ data: { firstName: 'Test' } });
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: [] });

    const { getByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Create New Job'));
    });

    expect(mockNavigate).toHaveBeenCalledWith('CreateIssue');
  });

  test('displays message when no offers available', async () => {
    axios.get.mockResolvedValueOnce({ data: { firstName: 'Jane' } }); // profile
    axios.get.mockResolvedValueOnce({ data: [] }); // quotes
    axios.get.mockResolvedValueOnce({ data: [] }); // notifications

    const { getByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );

    await waitFor(() => {
      expect(getByText('No offers available.')).toBeTruthy();
    });
  });

  test('displays unread notifications badge', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { firstName: 'Alex' } }) // profile
      .mockResolvedValueOnce({ data: [] }) // quotes
      .mockResolvedValueOnce({ data: [{ isRead: false }, { isRead: true }] }); // notifications
  
    const { getByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );
  
    await waitFor(() => {
      expect(getByText('1')).toBeTruthy(); // unread count badge
    });
  });

  test('navigates to NotificationPage on notification button press', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { firstName: 'Anna' } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });
  
    const { getByTestId } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );
  
    await waitFor(() => {
      fireEvent.press(getByTestId('notification-button'));
      expect(mockNavigate).toHaveBeenCalledWith('NotificationPage');
    });
  });

  test('navigates to OfferDetails when offer card is pressed', async () => {
    const profileData = {
      firstName: 'Lena',
      email: 'lena@example.com',
    };
  
    const mockOffer = {
      _id: 'offer123',
      professionalFirstName: 'Tom',
      professionalLastName: 'Jones',
      professionalEmail: 'tom@example.com',
      price: 200,
      createdAt: new Date().toISOString(),
      status: 'pending',
      professionalReviewCount: 3,
      professionalTotalRating: 4.7,
    };
  
    // Route-specific mocking
    axios.get.mockImplementation((url) => {
      if (url.includes('/client/profile')) {
        return Promise.resolve({ data: profileData });
      }
  
      if (url.includes(`/quotes/client/${profileData.email}`)) {
        return Promise.resolve({ data: [mockOffer] });
      }
  
      if (url.includes('/notification')) {
        return Promise.resolve({ data: [] });
      }
  
      return Promise.resolve({ data: [] }); // fallback
    });
  
    const { getByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );
  
    // Wait for the offer to appear
    await waitFor(() => expect(getByText('Tom Jones')).toBeTruthy());
  
    // Simulate tapping the offer card
    fireEvent.press(getByText('Tom Jones'));
  
    expect(mockNavigate).toHaveBeenCalledWith('OfferDetails', { offerId: 'offer123' });
  });

  test('accept offer triggers API and shows success alert', async () => {
    const mockProfile = {
      firstName: 'Maya',
      email: 'maya@example.com',
    };
  
    const mockOffer = {
      _id: 'offer456',
      professionalFirstName: 'Sam',
      professionalLastName: 'Lee',
      professionalEmail: 'sam@example.com',
      price: 200,
      createdAt: new Date().toISOString(),
      status: 'pending',
      professionalReviewCount: 1,
      professionalTotalRating: 5.0,
    };
  
    // Route-specific mocking
    axios.get.mockImplementation((url) => {
      if (url.includes('/client/profile')) {
        return Promise.resolve({ data: mockProfile });
      }
      if (url.includes(`/quotes/client/${mockProfile.email}`)) {
        return Promise.resolve({ data: [mockOffer] });
      }
      if (url.includes('/notification')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });
  
    axios.put.mockResolvedValueOnce({ status: 200 });
  
    const { getByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );
  
    // Wait for offer to appear
    await waitFor(() => {
      expect(getByText('Sam Lee')).toBeTruthy();
      expect(getByText('Accept')).toBeTruthy();
    });
  
    fireEvent.press(getByText('Accept'));
  
    // Confirm axios.put and alert were called
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/quotes/offer456'),
        { status: 'accepted' },
        expect.anything()
      );
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Offer accepted successfully.');

    });
  });

  test('reject offer triggers API and shows success alert', async () => {
    const mockProfile = {
      firstName: 'Maya',
      email: 'maya@example.com',
    };
  
    const mockOffer = {
      _id: 'offer789',
      professionalFirstName: 'Rick',
      professionalLastName: 'Grimes',
      professionalEmail: 'rick@example.com',
      price: 250,
      createdAt: new Date().toISOString(),
      status: 'pending',
      professionalReviewCount: 0,
      professionalTotalRating: 0,
    };
  
    // Route-specific axios.get mocks
    axios.get.mockImplementation((url) => {
      if (url.includes('/client/profile')) {
        return Promise.resolve({ data: mockProfile });
      }
      if (url.includes(`/quotes/client/${mockProfile.email}`)) {
        return Promise.resolve({ data: [mockOffer] });
      }
      if (url.includes('/notification')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });
  
    axios.put.mockResolvedValueOnce({ status: 200 });
  
    const { getByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );
  
    // Wait for offer to appear
    await waitFor(() => {
      expect(getByText('Rick Grimes')).toBeTruthy();
      expect(getByText('Reject')).toBeTruthy();
    });
  
    fireEvent.press(getByText('Reject'));
  
    // Confirm axios.put and alert were called
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/quotes/offer789'),
        { status: 'rejected' },
        expect.anything()
      );
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Offer rejected successfully.');
    });
  });

  test('renders categories section with all category names', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { firstName: 'User', email: 'user@example.com' } }) // profile
      .mockResolvedValueOnce({ data: [] }) // quotes
      .mockResolvedValueOnce({ data: [] }); // notifications
  
    const { getByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );
  
    await waitFor(() => {
      expect(getByText('Categories')).toBeTruthy();
      expect(getByText('Plumbing')).toBeTruthy();
      expect(getByText('Cleaning')).toBeTruthy();
      expect(getByText('Electrical')).toBeTruthy();
    });
  });

  test('navigates to AllCategories when View All is pressed in categories section', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { firstName: 'User', email: 'user@example.com' } }) // profile
      .mockResolvedValueOnce({ data: [] }) // quotes
      .mockResolvedValueOnce({ data: [] }); // notifications
  
    const { getAllByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );
  
    await waitFor(() => {
      const viewAllButtons = getAllByText('View All');
      expect(viewAllButtons.length).toBeGreaterThanOrEqual(1); // both categories + offers may have it
      fireEvent.press(viewAllButtons[0]); // tap the one for Categories section
    });
  
    expect(mockNavigate).toHaveBeenCalledWith('AllCategories');
  });

  test('navigates to OffersPage when View All is pressed in Offers section', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { firstName: 'User', email: 'user@example.com' } }) // profile
      .mockResolvedValueOnce({ data: [] }) // quotes
      .mockResolvedValueOnce({ data: [] }); // notifications
  
    const { getAllByText } = renderWithContext(
      <HomeScreen navigation={{ navigate: mockNavigate, setOptions: jest.fn() }} />
    );
  
    await waitFor(() => {
      const viewAllButtons = getAllByText('View All');
      expect(viewAllButtons.length).toBeGreaterThanOrEqual(2);
  
      fireEvent.press(viewAllButtons[1]); // second "View All" = Offers section
    });
  
    expect(mockNavigate).toHaveBeenCalledWith('OffersPage');
  });
  
});
