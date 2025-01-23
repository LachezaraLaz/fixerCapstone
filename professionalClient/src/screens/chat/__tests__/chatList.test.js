// chatList.test.js
import React from 'react';
import { render } from '@testing-library/react-native';
import ChannelListScreen from '../chatListPage';
import { useChatContext } from '../chatContext';
import { NavigationContainer } from '@react-navigation/native';

// Mocking necessary contexts and navigation
jest.mock('../chatContext', () => ({
    useChatContext: jest.fn()
}));

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    // Mocking specific configurations to avoid errors
    return {
        ...Reanimated,
        __reanimatedLoggerConfig: {}
    };
});

// Mocking stream-chat-expo components
jest.mock('stream-chat-expo', () => ({
    ChannelList: 'ChannelList'
}));

// Test suite
describe('ChannelListScreen Tests', () => {
    it('renders correctly', () => {
        useChatContext.mockImplementation(() => ({
            setChannel: jest.fn(),
            user: { id: '123' }
        }));

        const tree = render(
            <NavigationContainer>
                <ChannelListScreen />
            </NavigationContainer>
        );
        expect(tree).toBeDefined();
    });
});