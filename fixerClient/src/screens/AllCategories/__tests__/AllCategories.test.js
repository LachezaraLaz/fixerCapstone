import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AllCategories from '../AllCategories';
import { Text } from 'react-native';

// code to run only this file through the terminal:
// npm run test ./src/screens/AllCategories/__tests__/AllCategories.test.js
// or
// npm run test-coverage ./src/screens/AllCategories/__tests__/AllCategories.test.js

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: () => <Text>Ionicons</Text>,
  };
});

jest.mock('../../../../components/notificationButton', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <Text>NotificationButton</Text>,
  };
});

describe('AllCategories screen', () => {
  const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };

  test('renders title and all categories', () => {
    const { getByText } = render(<AllCategories navigation={mockNavigation} />);

    // Header
    expect(getByText('Categories')).toBeTruthy();

    // Categories
    expect(getByText('Plumbing')).toBeTruthy();
    expect(getByText('Cleaning')).toBeTruthy();
    expect(getByText('Electrical')).toBeTruthy();
  });

  test('back button calls navigation.goBack', () => {
    const { getByText } = render(<AllCategories navigation={mockNavigation} />);
    fireEvent.press(getByText('Ionicons'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
  
});
