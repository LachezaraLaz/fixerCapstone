// chatList.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ChannelListScreen from '../chatListPage';
import { useChatContext } from '../chatContext';

// code to run only this file through the terminal:
// npm run test ./src/screens/chat/__tests__/chatList.test.js
// or
// npm run test-coverage ./src/screens/chat/__tests__/chatList.test.js

// Override the useChatContext so we can control its returned values.
jest.mock('../chatContext', () => ({
    useChatContext: jest.fn(),
}));

// Mock react-native-reanimated to avoid errors in tests.
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    return {
        ...Reanimated,
        __reanimatedLoggerConfig: {},
    };
});

// We'll override stream-chat-expo, reusing our manual mock but replacing ChannelList with a Jest mock.
let mockChannelList; // Will hold our mock function for ChannelList.
jest.mock('stream-chat-expo', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');

    // Create a Jest mock function for ChannelList so we can inspect its props.
    mockChannelList = jest.fn(({ onSelect, filters, sort }) => (
        <TouchableOpacity
            testID="channel-list"
            onPress={() => onSelect({ id: 'dummy-channel' })}
        >
            <Text>ChannelList</Text>
        </TouchableOpacity>
    ));

    return {
        ChannelList: mockChannelList,
        Chat: ({ children }) => <>{children}</>,
        Channel: ({ children }) => <>{children}</>,
        MessageList: () => <Text>MessageList</Text>,
        MessageInput: () => <Text>MessageInput</Text>,
        OverlayProvider: ({ children }) => <>{children}</>,
    };
});

describe('ChannelListScreen Tests', () => {
    beforeEach(() => {
        // Clear previous calls to our ChannelList mock.
        if (mockChannelList) {
            mockChannelList.mockClear();
        }
    });

    it('renders correctly', () => {
        useChatContext.mockImplementation(() => ({
            setChannel: jest.fn(),
            user: { id: '123' }
        }));

        const tree = render(
            <NavigationContainer>
                <ChannelListScreen navigation={{ navigate: jest.fn() }} />
            </NavigationContainer>
        );
        expect(tree).toBeDefined();
    });

    it('calls setChannel and navigates to ChatPage when a channel is selected', () => {
        const setChannelMock = jest.fn();
        const navigateMock = jest.fn();

        useChatContext.mockImplementation(() => ({
            setChannel: setChannelMock,
            user: { id: '123' },
        }));

        const { getByTestId } = render(
            <NavigationContainer>
                <ChannelListScreen navigation={{ navigate: navigateMock }} />
            </NavigationContainer>
        );

        // Simulate a press on the ChannelList (which calls onSelect with a dummy channel).
        const channelListElement = getByTestId('channel-list');
        fireEvent.press(channelListElement);

        expect(setChannelMock).toHaveBeenCalledWith({ id: 'dummy-channel' });
        expect(navigateMock).toHaveBeenCalledWith('ChatPage');
    });

    it('passes correct filters and sort props when user is defined', () => {
        const setChannelMock = jest.fn();
        const navigateMock = jest.fn();
        const user = { id: 'user123' };

        useChatContext.mockImplementation(() => ({
            setChannel: setChannelMock,
            user: user,
        }));

        render(
            <NavigationContainer>
                <ChannelListScreen navigation={{ navigate: navigateMock }} />
            </NavigationContainer>
        );

        // Verify that ChannelList was called with the proper props.
        expect(mockChannelList).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: { members: { '$in': [user.id] } },
                sort: { last_message_at: -1 },
            }),
            {}
        );
    });

    it('passes correct filters and sort props when user is undefined', () => {
        const setChannelMock = jest.fn();
        const navigateMock = jest.fn();

        // When user is not provided, the filter should fall back to an empty string.
        useChatContext.mockImplementation(() => ({
            setChannel: setChannelMock,
            user: null,
        }));

        render(
            <NavigationContainer>
                <ChannelListScreen navigation={{ navigate: navigateMock }} />
            </NavigationContainer>
        );

        // Check that ChannelList receives filters with an empty string.
        expect(mockChannelList).toHaveBeenCalledWith(
            expect.objectContaining({
                filters: { members: { '$in': [''] } },
                sort: { last_message_at: -1 },
            }),
            {}
        );
    });
});
