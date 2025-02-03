// ChatContext.test.js
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ChatProvider, ChatContext } from '../chatContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamChat } from 'stream-chat';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
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
        // Simulate missing credentials
        AsyncStorage.getItem.mockImplementation((key) => Promise.resolve(null));

        let contextValue;
        const Consumer = () => {
            const context = React.useContext(ChatContext);
            contextValue = context;
            return null;
        };

        render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        // Wait for the async useEffect in ChatProvider to complete.
        await waitFor(() => expect(contextValue).toBeDefined());

        expect(contextValue.chatClient).toBeNull();
        expect(StreamChat.getInstance).not.toHaveBeenCalled();
    });

    it('initializes chat client when valid credentials are found', async () => {
        // Simulate valid credentials
        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('user1');
            if (key === 'userName') return Promise.resolve('User One');
            if (key === 'streamToken') return Promise.resolve('token123');
            return Promise.resolve(null);
        });

        let contextValue;
        const Consumer = () => {
            const context = React.useContext(ChatContext);
            contextValue = context;
            return null;
        };

        render(
            <ChatProvider>
                <Consumer />
            </ChatProvider>
        );

        // Wait for chatClient to be set in the context.
        await waitFor(() => expect(contextValue.chatClient).not.toBeNull());

        expect(StreamChat.getInstance).toHaveBeenCalled();
        const fakeClient = contextValue.chatClient;
        expect(fakeClient.connectUser).toHaveBeenCalledWith(
            { id: 'user1', name: 'User One' },
            'token123'
        );
        // Also, check that the user object in context is set.
        expect(contextValue.user).toEqual({ id: 'user1', name: 'User One' });
    });
});
