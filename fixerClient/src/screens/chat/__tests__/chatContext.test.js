// __tests__/ChatContext.test.js
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ChatProvider, ChatContext } from '../chatContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamChat } from 'stream-chat';

// Mock StreamChat instance methods
const mockConnectUser = jest.fn();
const mockDisconnectUser = jest.fn();

jest.mock('stream-chat', () => ({
    StreamChat: {
        getInstance: jest.fn(() => ({
            connectUser: mockConnectUser,
            disconnectUser: mockDisconnectUser
        }))
    }
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn()
}));

describe('ChatContext', () => {
    beforeEach(() => {
        AsyncStorage.getItem.mockResolvedValueOnce('user-id')
            .mockResolvedValueOnce('user-name')
            .mockResolvedValueOnce('stream-token');
        mockConnectUser.mockResolvedValue(null); // Ensure this resolves to simulate successful connection
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes chat client correctly', async () => {
        const TestComponent = () => {
            const context = React.useContext(ChatContext);
            return null;
        };

        render(<ChatProvider><TestComponent /></ChatProvider>);

        await waitFor(() => {
            expect(AsyncStorage.getItem).toHaveBeenCalledTimes(3);
            expect(mockConnectUser).toHaveBeenCalled();
        });
    });
});
