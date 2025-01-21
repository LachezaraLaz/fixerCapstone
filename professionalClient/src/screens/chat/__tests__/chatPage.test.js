// chatPage.test.js
import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ChatPage from '../chatPage';
import { useChatContext } from '../chatContext';
import { NavigationContainer } from '@react-navigation/native';

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

describe('ChatPage Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders message list and input when channel is selected', () => {
        useChatContext.mockImplementation(() => ({
            channel: { id: 'channel1', name: 'General' }
        }));

        const { getByText } = render(
            <NavigationContainer>
                <ChatPage />
            </NavigationContainer>
        );

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
});
