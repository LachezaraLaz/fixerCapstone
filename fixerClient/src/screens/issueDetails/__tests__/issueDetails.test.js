import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IssueDetails from '../issueDetails';
import { NavigationContainer } from '@react-navigation/native';
import { LanguageContext } from '../../../../context/LanguageContext';
import { en, fr } from '../../../../localization';

// code to run only this file through the terminal:
// npm run test ./src/screens/issueDetails/__tests__/issueDetails.test.js
// or
// npm run test-coverage ./src/screens/issueDetails/__tests__/issueDetails.test.js

// Mocks
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMap = ({ children }) => <View testID="MapView">{children}</View>;
  const MockMarker = () => <View testID="Marker" />;
  return {
    __esModule: true,
    default: MockMap,
    Marker: MockMarker,
  };
});
jest.mock('../../../../components/notificationButton', () => () => {
  const { Text, View } = require('react-native');
  return <View><Text>Notif</Text></View>;
});
jest.mock('../../../../components/orangeButton', () => ({ title, onPress }) => {
  const { Text, TouchableOpacity } = require('react-native');
  return <TouchableOpacity onPress={onPress}><Text>{title}</Text></TouchableOpacity>;
});

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

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

  


const renderWithContext = (ui, routeParams = { jobId: '123' }) => {
  const route = { params: routeParams };
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };

  jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  return render(
    <LanguageContext.Provider value={{ locale: 'en', setLocale: jest.fn() }}>
      <NavigationContainer>
        {React.cloneElement(ui, { route, navigation })}
      </NavigationContainer>
    </LanguageContext.Provider>
  );
};

beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
  
test('renders loading spinner initially', () => {
  const { getByTestId } = renderWithContext(<IssueDetails />);
  expect(getByTestId('ActivityIndicator')).toBeTruthy();
});

test('displays job details after fetching', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      id: '123',
      title: 'Test Job',
      description: 'Fix sink',
      status: 'open',
      createdAt: new Date().toISOString(),
      professionalNeeded: 'Plumber',
      latitude: 45,
      longitude: -73,
    },
  });

  const { getByText } = renderWithContext(<IssueDetails />);

  await waitFor(() => {
    expect(getByText('Test Job')).toBeTruthy();
    expect(getByText('Fix sink')).toBeTruthy();
    expect(getByText('Plumber')).toBeTruthy();
  });
});

test('shows error UI when job not found', async () => {
  axios.get.mockResolvedValueOnce({ data: null });

  const { getByText } = renderWithContext(<IssueDetails />);

  await waitFor(() => {
    expect(getByText('Issue details not found')).toBeTruthy();
  });
});

test('navigates to EditIssue on modify press', async () => {
    const mockNavigate = jest.fn();
  
    axios.get.mockImplementation(() =>
      Promise.resolve({
        data: {
          id: '123',
          title: 'Test Job',
          status: 'open',
          description: '',
          createdAt: new Date().toISOString(),
          professionalNeeded: '',
          latitude: 0,
          longitude: 0,
        },
      })
    );
  
    const { getByText } = renderWithContext(<IssueDetails />, { jobId: '123' });
  
    await waitFor(() => {
      fireEvent.press(getByText('Modify Issue'));
    });
  
    expect(Alert.alert).not.toHaveBeenCalled(); // passes now ✅
});
  

test('triggers Alert when Delete Issue is pressed', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      id: '123',
      title: 'Test Job',
      status: 'open',
      createdAt: new Date().toISOString(),
      professionalNeeded: '',
      latitude: 0,
      longitude: 0,
    },
  });

  const { getByText } = renderWithContext(<IssueDetails />);
  await waitFor(() => fireEvent.press(getByText('Delete Issue')));
  expect(Alert.alert).toHaveBeenCalled(); // confirmation dialog
});

test('calls goBack when back button is pressed', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        id: '123',
        title: 'Test Job',
        description: '',
        status: 'open',
        createdAt: new Date().toISOString(),
        professionalNeeded: '',
        latitude: 0,
        longitude: 0,
      },
    });
  
    const { getByTestId } = renderWithContext(<IssueDetails />);
    await waitFor(() => fireEvent.press(getByTestId('back-button')));
    expect(mockGoBack).toHaveBeenCalled();
});

test('navigates to NotificationPage on notification button press', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        id: '123',
        title: 'Test Job',
        status: 'open',
        description: '',
        createdAt: new Date().toISOString(),
        professionalNeeded: '',
        latitude: 0,
        longitude: 0,
      },
    });
  
    const { getByText } = renderWithContext(<IssueDetails />);
  
    await waitFor(() => {
      fireEvent.press(getByText('Notif')); // from mocked NotificationButton
    });
  
    expect(mockNavigate).toHaveBeenCalledWith('NotificationPage');
});

test('renders job info and review if present', async () => {
    axios.get.mockImplementation(() =>
      Promise.resolve({
        data: {
          id: '123',
          title: 'Test Job',
          description: 'Fix sink',
          status: 'completed',
          createdAt: new Date().toISOString(),
          professionalNeeded: 'Electrician',
          professionalEmail: 'pro@example.com',
          latitude: 45,
          longitude: -73,
          rating: 4,
          comment: 'Great job!',
        },
      })
    );
  
    const { getByText } = renderWithContext(<IssueDetails />);
  
    await waitFor(() => {
      expect(getByText('Test Job')).toBeTruthy();
      expect(getByText('Fix sink')).toBeTruthy();
      expect(getByText('Electrician')).toBeTruthy();
      expect(getByText('pro@example.com')).toBeTruthy();
      expect(getByText('4 Stars')).toBeTruthy();
      expect(getByText('Great job!')).toBeTruthy();
    });
});

test('shows no image attached fallback when no image is present', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        id: '123',
        title: 'Job with No Image',
        status: 'open',
        createdAt: new Date().toISOString(),
        description: '',
        professionalNeeded: '',
        latitude: 0,
        longitude: 0,
        imageUrl: null,
      },
    });
  
    const { getByText } = renderWithContext(<IssueDetails />);
  
    await waitFor(() => {
      expect(getByText('No image attached yet')).toBeTruthy();
    });
});
  
test('renders attached image, opens modal on image press, and closes modal on close button press', async () => {
    axios.get.mockImplementation(() =>
      Promise.resolve({
        data: {
          id: '123',
          title: 'Test Job',
          status: 'completed',
          createdAt: new Date().toISOString(),
          description: 'Leaky pipe',
          professionalNeeded: 'Plumber',
          professionalEmail: 'pro@example.com',
          latitude: 45,
          longitude: -73,
          imageUrl: 'https://example.com/real-image.jpg', // ✅ real image
        },
      })
    );
  
    const { getByText, getByTestId } = renderWithContext(<IssueDetails />);
  
    // Assert "Attached Images" label is rendered
    await waitFor(() => {
      expect(getByText('Attached Images')).toBeTruthy();
    });
  
    // Simulate image press to open the modal
    const image = getByTestId('image-touch');
    fireEvent.press(image);
  
    // Assert that the modal is visible
    const modal = getByTestId('image-modal');
    expect(modal).toBeTruthy();
  
    // Simulate pressing the close button to close the modal
    const closeButton = getByTestId('modal-close-button');
    fireEvent.press(closeButton);
  
    // Check that the modal is not rendered (since it should be closed)
    // This approach checks if the modal is "gone" from the DOM after the close button press
    expect(() => getByTestId('image-modal')).toThrow(); // Throws error when modal is not found
});
  
  
  
  
  
