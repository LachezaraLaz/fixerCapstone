import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddReview from '../addReview';
import { LanguageContext } from '../../../../context/LanguageContext';
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
import { en } from '../../../../localization';

// code to run only this file through the terminal:
// npm run test ./src/screens/addReview/__tests__/addReview.test.js
// or
// npm run test-coverage ./src/screens/addReview/__tests__/addReview.test.js

// Mocks
jest.mock('axios');

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: () => <Text>Ionicons</Text>,
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
  

jest.mock('../../../../components/inputField', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return {
    __esModule: true,
    default: (props) => <TextInput testID={props.testID || 'mock-input-field'} {...props} />,
  };
});

jest.mock('../../../../components/orangeButton', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ onPress, title }) => <Text onPress={onPress}>{title}</Text>,
  };
});

jest.mock('../../../../components/customAlertError', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      __esModule: true,
      default: ({ visible, message }) => visible ? <Text>{message}</Text> : null,
    };
});
  
jest.mock('../../../../components/customAlertSuccess', () => ({
    __esModule: true,
    default: (props) => {
      const React = require('react');
      const { Text } = require('react-native');
      return props.visible ? (
        <>
          <Text>{props.message}</Text>
          <Text testID="success-alert-close" onPress={props.onClose}>Close</Text>
        </>
      ) : null;
    },
  }));
  
  

const mockLanguageContext = {
  locale: 'en',
  changeLanguage: jest.fn(),
};

const mockNavigation = {
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    jobId: '1234',
  },
};

const renderComponent = () =>
  render(
    <LanguageContext.Provider value={mockLanguageContext}>
      <NavigationContainer>
        <AddReview navigation={mockNavigation} route={mockRoute} />
      </NavigationContainer>
    </LanguageContext.Provider>
  );

describe('AddReview', () => {
  test('renders correctly with initial state', () => {
    const { getByText } = renderComponent();
    expect(getByText(en.add_modify_review)).toBeTruthy();
    expect(getByText(en.submit_review)).toBeTruthy();
  });

  test('shows error if fields are empty', async () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText(en.submit_review));
    await waitFor(() => {
      expect(getByText(en.review_incomplete_form)).toBeTruthy();
    });
  });

  test('shows error if rating is invalid', async () => {
    const { getAllByTestId, getByText, getAllByText } = renderComponent();
    const inputs = getAllByTestId('mock-input-field');
    fireEvent.changeText(inputs[0], '7'); // Invalid rating
    fireEvent.changeText(inputs[1], 'This is a valid comment.');
    fireEvent.press(getByText(en.submit_review));
    await waitFor(() => {
        const errorMessages = getAllByText(en.review_rating_error);
        expect(errorMessages.length).toBeGreaterThanOrEqual(1);
      });
      
  });

  test('submits review and shows success alert', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    const { getAllByTestId, getByText } = renderComponent();
    const inputs = getAllByTestId('mock-input-field');
    fireEvent.changeText(inputs[0], '5');
    fireEvent.changeText(inputs[1], 'Amazing work!');

    fireEvent.press(getByText(en.submit_review));
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/reviews/add'),
        expect.objectContaining({ rating: 5, comment: 'Amazing work!', jobId: '1234' })
      );
    });
  });

  test('handles submission error gracefully', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Something went wrong' } },
    });

    const { getAllByTestId, getByText } = renderComponent();
    fireEvent.changeText(getAllByTestId('mock-input-field')[0], '5');
    fireEvent.changeText(getAllByTestId('mock-input-field')[1], 'Solid job');
    fireEvent.press(getByText(en.submit_review));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(getByText('Something went wrong')).toBeTruthy();
    });
  });

  test('navigates back on success alert close', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });
  
    const { getByText, getAllByTestId, getByTestId } = renderComponent();
  
    fireEvent.changeText(getAllByTestId('mock-input-field')[0], '5'); // valid rating
    fireEvent.changeText(getAllByTestId('mock-input-field')[1], 'Great job!'); // valid comment
    fireEvent.press(getByText(en.submit_review));
  
    // Wait for the success message
    await waitFor(() => {
      expect(getByText(en.review_added_successfully)).toBeTruthy();
    });
  
    // Close the success alert
    fireEvent.press(getByTestId('success-alert-close'));
  
    // Assert navigation happened
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
  
});
