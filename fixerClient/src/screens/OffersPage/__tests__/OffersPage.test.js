import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OffersPage from '../OffersPage';
import { LanguageContext } from '../../../../context/LanguageContext';
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { en, fr } from '../../../../localization';
import { I18n } from 'i18n-js';

// code to run only this file through the terminal:
// npm run test ./src/screens/OffersPage/__tests__/OffersPage.test.js
// or
// npm run test-coverage ./src/screens/OffersPage/__tests__/OffersPage.test.js

jest.mock('axios');

let mockGoBack, mockNavigate;

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  mockGoBack = jest.fn();
  mockNavigate = jest.fn();
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));


const renderWithContext = () => {
    return render(
      <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
        <OffersPage navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />
      </LanguageContext.Provider>
    );
};
  

describe('OffersPage', () => {
    const mockNavigate = jest.fn();
    const profile = { email: 'client@example.com' };

    const offer = {
        _id: 'offer123',
        professionalFirstName: 'Alex',
        professionalLastName: 'Smith',
        professionalEmail: 'alex@example.com',
        price: 150,
        createdAt: new Date().toISOString(),
        status: 'pending',
        professionalReviewCount: 5,
        professionalTotalRating: 4.5,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    test('shows loader initially', async () => {
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        axios.get.mockResolvedValue({ data: { email: 'test@example.com' } });

        const { getByTestId } = renderWithContext();
        expect(getByTestId('ActivityIndicator')).toBeTruthy();
    });

    test('displays offers after fetching', async () => {
        const mockEmail = 'client@example.com';
      
        AsyncStorage.getItem.mockResolvedValue('mock-token');
      
        axios.get.mockImplementation((url) => {
            if (url.includes('/client/profile')) {
              return Promise.resolve({ status: 200, data: { email: mockEmail } });
            }
            if (url.includes(`/quotes/client/${mockEmail}`)) {
              return Promise.resolve({ status: 200, data: [offer] });
            }
            return Promise.resolve({ status: 200, data: [] });
        });
          
      
        const { getByText, queryByTestId } = renderWithContext();
      
        await waitFor(() => {
            expect(queryByTestId('ActivityIndicator')).toBeNull();
            expect(getByText('Alex Smith')).toBeTruthy();
            expect(getByText('Price: $150')).toBeTruthy();
        });  
    });

    test('navigates back when back button is pressed', async () => {
        const { getByTestId, queryByTestId } = renderWithContext();
      
        await waitFor(() => {
            expect(queryByTestId('ActivityIndicator')).toBeNull();
            fireEvent.press(getByTestId('back-button'));
            expect(mockGoBack).toHaveBeenCalled();
        });  
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
      
        axios.get.mockImplementation((url) => {
          if (url.includes('/client/profile')) {
            return Promise.resolve({ status: 200, data: mockProfile });
          }
          if (url.includes(`/quotes/client/${mockProfile.email}`)) {
            return Promise.resolve({ status: 200, data: [mockOffer] });
          }
          return Promise.resolve({ status: 200, data: [] });
        });
      
        axios.put.mockResolvedValueOnce({ status: 200 });
      
        const { getByText, queryByTestId } = renderWithContext();
      
        // Wait for ActivityIndicator to disappear before continuing
        await waitFor(() => {
          expect(queryByTestId('ActivityIndicator')).toBeNull();
        });
      
        // Confirm offer has rendered
        expect(getByText('Sam Lee')).toBeTruthy();
        expect(getByText('Accept')).toBeTruthy();
      
        // Press Accept
        fireEvent.press(getByText('Accept'));
      
        // Confirm API and Alert
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining('/quotes/offer456'),
            { status: 'accepted' },
            expect.anything()
          );
      
          expect(Alert.alert).toHaveBeenCalledWith(
            'Offer Accepted',
            'You have accepted the offer.'
          );
        });
    });

    test('reject offer triggers API and shows success alert', async () => {
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
      
        axios.get.mockImplementation((url) => {
          if (url.includes('/client/profile')) {
            return Promise.resolve({ status: 200, data: mockProfile });
          }
          if (url.includes(`/quotes/client/${mockProfile.email}`)) {
            return Promise.resolve({ status: 200, data: [mockOffer] });
          }
          return Promise.resolve({ status: 200, data: [] });
        });
      
        axios.put.mockResolvedValueOnce({ status: 200 });
      
        const { getByText, queryByTestId } = renderWithContext();
      
        // Wait for loading to finish
        await waitFor(() => {
          expect(queryByTestId('ActivityIndicator')).toBeNull();
        });
      
        // Confirm offer and button exist
        expect(getByText('Sam Lee')).toBeTruthy();
        expect(getByText('Reject')).toBeTruthy();
      
        // Click "Reject"
        fireEvent.press(getByText('Reject'));
      
        // Validate API and alert
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining('/quotes/offer456'),
            { status: 'rejected' },
            expect.anything()
          );
      
          expect(Alert.alert).toHaveBeenCalledWith(
            'Offers Rejected',
            'You have rejected the offer.'
          );
        });
    });

    test('shows alert when offers response is not an array', async () => {
        const mockProfile = {
          email: 'maya@example.com',
        };
      
        // Mock profile fetch
        axios.get.mockImplementation((url) => {
          if (url.includes('/client/profile')) {
            return Promise.resolve({ status: 200, data: mockProfile });
          }
          if (url.includes(`/quotes/client/${mockProfile.email}`)) {
            // Return a non-array response (this will hit the "else" block)
            return Promise.resolve({ status: 200, data: { invalid: true } });
          }
          return Promise.resolve({ status: 200, data: [] });
        });
      
        const { queryByTestId } = renderWithContext();
      
        await waitFor(() => {
          expect(queryByTestId('ActivityIndicator')).toBeNull();
          expect(Alert.alert).toHaveBeenCalledWith('No offers found for your jobs.');
        });
    });
      
});
