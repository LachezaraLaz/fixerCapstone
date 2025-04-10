import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OfferDetails from '../OfferDetails';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// code to run only this file through the terminal:
// npm run test ./src/screens/OfferDetails/__tests__/OfferDetails.test.js
// or
// npm run test-coverage ./src/screens/OfferDetails/__tests__/OfferDetails.test.js

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

const renderComponent = (offerId = '123') => {
  return render(
    <NavigationContainer>
      <OfferDetails route={{ params: { offerId } }} navigation={{ goBack: mockGoBack, navigate: mockNavigate }} />
    </NavigationContainer>
  );
};

describe('OfferDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner initially', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  test('displays quote details after fetch', async () => {
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    axios.get
      .mockResolvedValueOnce({ data: { email: 'client@example.com' } }) // Profile
      .mockResolvedValueOnce({ data: [{ _id: '123', jobDescription: 'Fix faucet', toolsMaterials: 'Wrench', price: 100, termsConditions: 'Be careful', status: 'pending' }] }); // Quotes

    const { getByText } = renderComponent('123');

    await waitFor(() => {
      expect(getByText('Fix faucet')).toBeTruthy();
      expect(getByText('Wrench')).toBeTruthy();
      expect(getByText('$100')).toBeTruthy();
      expect(getByText('Be careful')).toBeTruthy();
    });
  });

  test('handles offer not found', async () => {
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    axios.get
      .mockResolvedValueOnce({ data: { email: 'client@example.com' } })
      .mockResolvedValueOnce({ data: [] });

    renderComponent('nonexistent');

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Offer not found.');
    });
  });

  test('accepts the offer', async () => {
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    axios.get
      .mockResolvedValueOnce({ data: { email: 'client@example.com' } })
      .mockResolvedValueOnce({ data: [{ _id: '123', jobDescription: 'Fix faucet', toolsMaterials: 'Wrench', price: 100, termsConditions: 'Be careful', status: 'pending' }] });
    axios.put.mockResolvedValue({ status: 200 });

    const { getByText } = renderComponent('123');

    const acceptButton = await waitFor(() => getByText('Accept'));
    fireEvent.press(acceptButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/quotes/123'), { status: 'accepted' }, expect.anything());
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Offer accepted');
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  test('rejects the offer', async () => {
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    axios.get
      .mockResolvedValueOnce({ data: { email: 'client@example.com' } })
      .mockResolvedValueOnce({ data: [{ _id: '123', jobDescription: 'Fix faucet', toolsMaterials: 'Wrench', price: 100, termsConditions: 'Be careful', status: 'pending' }] });
    axios.put.mockResolvedValue({ status: 200 });

    const { getByText } = renderComponent('123');

    const rejectButton = await waitFor(() => getByText('Reject'));
    fireEvent.press(rejectButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/quotes/123'), { status: 'rejected' }, expect.anything());
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Offer rejected');
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  test('handles fetch error', async () => {
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    axios.get.mockRejectedValue(new Error('Fetch failed'));

    renderComponent();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'An error occurred.');
    });
  });
});
