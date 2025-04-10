// ChatScreens.test.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ChatScreens from '../chatScreens';
import { ChatContext } from '../chatContext';

// code to run only this file through the terminal:
// npm run test ./src/screens/chat/__tests__/chatScreens.test.js
// or
// npm run test-coverage ./src/screens/chat/__tests__/chatScreens.test.js

// If needed, mock the screens that are used by the navigator.
jest.mock('../chatListPage', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return () => <Text>ChatListPage Component</Text>;
});

jest.mock('../chatPage', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return () => <Text>ChatPage Component</Text>;
});

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
}));

describe('ChatScreens', () => {
    it('renders null when chatClient is null', () => {
        const { toJSON } = render(
            <ChatContext.Provider value={{ chatClient: null }}>
                <ChatScreens />
            </ChatContext.Provider>
        );
        expect(toJSON()).toBeNull();
    });

    it('renders Chat and navigator when chatClient is provided', () => {
        const fakeClient = {}; // This can be an empty object or a fake client with additional methods if needed.
        const { toJSON, getByText } = render(
            <NavigationContainer>
                <ChatContext.Provider value={{ chatClient: fakeClient }}>
                    <ChatScreens />
                </ChatContext.Provider>
            </NavigationContainer>
        );

        // Since our __mocks__/stream-chat-expo.js now provides a simple Chat component,
        // we expect the output not to be null.
        expect(toJSON()).not.toBeNull();
        expect(getByText('ChatListPage Component')).toBeTruthy();

        // Optionally, if your navigator renders one of the screens immediately,
        // you could check for that text.
        // For example, if ChatListPage is the initial screen:
        // expect(getByText('ChatListPage Component')).toBeTruthy();
    });
});
