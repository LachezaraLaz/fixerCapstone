// ChatContext.test.js
import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { ChatProvider, ChatContext, useChatContext } from '../chatContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamChat } from 'stream-chat';



// Existing mocks for AsyncStorage and StreamChat.
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('stream-chat', () => {
    const mClient = {
        connectUser: jest.fn(() => Promise.resolve()),
        disconnectUser: jest.fn(),
    };
    return {
        StreamChat: {
            getInstance: jest.fn(() => mClient),
        },
    };
});

describe('ChatProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not initialize chat client if no credentials are found', async () => {
        // Simulate missing credentials.
        AsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));

        let contextValue;
        const Consumer = () => {
            contextValue = React.useContext(ChatContext);
            return null;
        };

        render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        // Wait for the async useEffect to complete.
        await waitFor(() => expect(contextValue).toBeDefined());

        expect(contextValue.chatClient).toBeNull();
        expect(StreamChat.getInstance).not.toHaveBeenCalled();
    });

    it('initializes chat client when valid credentials are found', async () => {
        // Simulate valid credentials.
        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('user1');
            if (key === 'userName') return Promise.resolve('User One');
            if (key === 'streamToken') return Promise.resolve('token123');
            return Promise.resolve(null);
        });

        let contextValue;
        const Consumer = () => {
            contextValue = React.useContext(ChatContext);
            return null;
        };

        render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        // Wait for the chatClient to be set.
        await waitFor(() => expect(contextValue.chatClient).not.toBeNull());

        expect(StreamChat.getInstance).toHaveBeenCalled();
        const fakeClient = contextValue.chatClient;
        expect(fakeClient.connectUser).toHaveBeenCalledWith(
            { id: 'user1', name: 'User One' },
            'token123'
        );
        expect(contextValue.user).toEqual({ id: 'user1', name: 'User One' });
    });

    it('initializes chat client with default name ("NoName") when storedUserName is missing', async () => {
        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('user1');
            if (key === 'userName') return Promise.resolve(null); // userName missing
            if (key === 'streamToken') return Promise.resolve('token123');
            return Promise.resolve(null);
        });

        let contextValue;
        const Consumer = () => {
            contextValue = React.useContext(ChatContext);
            return null;
        };

        render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        await waitFor(() => expect(contextValue.chatClient).not.toBeNull());

        const fakeClient = contextValue.chatClient;
        expect(fakeClient.connectUser).toHaveBeenCalledWith(
            { id: 'user1', name: 'NoName' },
            'token123'
        );
    });

    it('handles errors during initialization (e.g., connectUser rejection)', async () => {
        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('user1');
            if (key === 'userName') return Promise.resolve('User One');
            if (key === 'streamToken') return Promise.resolve('token123');
            return Promise.resolve(null);
        });
        const error = new Error('connect error');
        const mClient = {
            connectUser: jest.fn(() => Promise.reject(error)),
            disconnectUser: jest.fn(),
        };
        StreamChat.getInstance.mockReturnValue(mClient);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        let contextValue;
        const Consumer = () => {
            contextValue = React.useContext(ChatContext);
            return null;
        };

        render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        await waitFor(() => expect(contextValue).toBeDefined());
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing chat:', error);
        expect(contextValue.chatClient).toBeNull();
        consoleErrorSpy.mockRestore();
    });

    it('calls disconnectUser on unmount if chatClient is set', async () => {
        const disconnectUserMock = jest.fn();
        const fakeClient = {
            connectUser: jest.fn(() => Promise.resolve()),
            disconnectUser: disconnectUserMock
        };

        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('user1');
            if (key === 'userName') return Promise.resolve('User One');
            if (key === 'streamToken') return Promise.resolve('token123');
            return Promise.resolve(null);
        });
        StreamChat.getInstance.mockReturnValue(fakeClient);

        let contextValue;
        const Consumer = () => {
            contextValue = React.useContext(ChatContext);
            React.useEffect(() => {
                // Manually update chatClient to simulate a successful connection.
                contextValue.setChatClient(fakeClient);
            }, []);
            return null;
        };

        const { unmount } = render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        await waitFor(() => expect(contextValue.chatClient).toBe(fakeClient));
        unmount();
        expect(disconnectUserMock).toHaveBeenCalled();
    });

    it('renders children inside the provider', () => {
        // This test ensures that ChatProvider properly renders its children.
        const { getByText } = render(
            <ChatProvider>
                <Text>Child Content</Text>
            </ChatProvider>
        );
        expect(getByText('Child Content')).toBeTruthy();
    });

    it('useChatContext returns the expected context object', () => {
        let contextValue;
        const Consumer = () => {
            contextValue = useChatContext();
            return null;
        };

        render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        expect(contextValue).toHaveProperty('chatClient');
        expect(contextValue).toHaveProperty('setChatClient');
        expect(contextValue).toHaveProperty('channel');
        expect(contextValue).toHaveProperty('setChannel');
        expect(contextValue).toHaveProperty('thread');
        expect(contextValue).toHaveProperty('setThread');
        expect(contextValue).toHaveProperty('user');
        expect(contextValue).toHaveProperty('setUser');
    });

    it('handles error when AsyncStorage.getItem rejects', async () => {
        const asyncError = new Error('AsyncStorage error');
        AsyncStorage.getItem.mockRejectedValue(asyncError);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        let contextValue;
        const Consumer = () => {
            contextValue = React.useContext(ChatContext);
            return null;
        };

        render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        // Even if AsyncStorage fails, the provider should eventually finish its effect.
        await waitFor(() => expect(contextValue).toBeDefined());
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing chat:', asyncError);
        // chatClient should remain null in error case.
        expect(contextValue.chatClient).toBeNull();
        consoleErrorSpy.mockRestore();
    });
});
