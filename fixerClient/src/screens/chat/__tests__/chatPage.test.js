import React from 'react';
import { render, fireEvent, act  } from '@testing-library/react-native';
import ChatPage from '../chatPage';
import { useChatContext } from '../chatContext';
import { NavigationContainer } from '@react-navigation/native';
import { Keyboard, Platform } from 'react-native';

// code to run only this file through the terminal:
// npm run test ./src/screens/chat/__tests__/chatPage.test.js
// or
// npm run test-coverage ./src/screens/chat/__tests__/chatPage.test.js

// Mocking necessary contexts and libraries
jest.mock('../chatContext', () => ({
    useChatContext: jest.fn()
}));

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    return {
        ...Reanimated,
        __reanimatedLoggerConfig: {}
    };
});

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      Ionicons: (props) => <Text {...props}>Ionicons</Text>,
    };
});
  

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
    NavigationContainer: actualNav.NavigationContainer,
  };
});

let keyboardListeners = {};

jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  addListener: (eventType, callback) => {
    keyboardListeners[eventType] = callback;
    return {
      remove: jest.fn(),
    };
  },
}));



describe('ChatPage Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders message list and input when channel is selected', () => {
        useChatContext.mockImplementation(() => ({
          channel: { id: 'channel1', name: 'General' },
          user: { name: 'TestUser' }, 
        }));
      
        const { getByText } = render(
          <NavigationContainer>
            <ChatPage />
          </NavigationContainer>
        );
      
        // You can optionally check for the username too
        expect(getByText('TestUser')).toBeTruthy();
        expect(getByText('MessageList')).toBeTruthy();
        expect(getByText('MessageInput')).toBeTruthy();
    });
      

    it('displays no channel selected when no channel is present', () => {
        useChatContext.mockImplementation(() => ({
            channel: null
        }));

        const { getByText } = render(
            <NavigationContainer>
                <ChatPage />
            </NavigationContainer>
        );

        expect(getByText('No channel selected')).toBeTruthy();
    });

    it('responds to keyboard show/hide and back button press', () => {
        useChatContext.mockImplementation(() => ({
          channel: { id: '123', name: 'Test Channel' },
          user: { name: 'TestUser' },
        }));
      
        const { getByText } = render(
          <NavigationContainer>
            <ChatPage />
          </NavigationContainer>
        );
      
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
      
        act(() => {
          keyboardListeners[showEvent]?.(); // Simulate keyboard showing
          keyboardListeners[hideEvent]?.(); // Simulate keyboard hiding
        });
      
        const backIcon = getByText('Ionicons'); // Mocked back icon
        fireEvent.press(backIcon);
        expect(mockGoBack).toHaveBeenCalled();
      });
      
});