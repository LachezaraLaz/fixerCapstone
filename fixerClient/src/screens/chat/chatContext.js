import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamChat } from "stream-chat";
import { OverlayProvider } from 'stream-chat-expo';
import { STREAM_API_KEY } from "./chatConfig";
/**
 * @module fixerClient
 */

/**
 * Context for managing chat-related state in the application.
 * 
 * @typedef {Object} ChatContext
 * @property {Object|null} chatClient - The chat client instance.
 * @property {Function} setChatClient - Function to set the chat client instance.
 * @property {Object|null} channel - The current chat channel.
 * @property {Function} setChannel - Function to set the current chat channel.
 * @property {Object|null} thread - The current chat thread.
 * @property {Function} setThread - Function to set the current chat thread.
 * @property {Object|null} user - The current user.
 * @property {Function} setUser - Function to set the current user.
 */
export const ChatContext = React.createContext({
    chatClient: null,
    setChatClient: () => {},
    channel: null,
    setChannel: () => {},
    thread: null,
    setThread: () => {},
    user: null,
    setUser: () => {},
});

export const ChatProvider = ({ children }) => {
    const [chatClient, setChatClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [thread, setThread] = useState(null);
    const [user, setUser] = useState(null);
    const [loadingClient, setLoadingClient] = useState(true);

    const chatClientRef = useRef(chatClient);
    useEffect(() => {
        chatClientRef.current = chatClient;
    }, [chatClient]);

    useEffect(() => {
        /**
         * Initializes the chat client by connecting the user to the StreamChat service.
         * 
         * This function retrieves the user credentials (userId, userName, and streamToken) from AsyncStorage.
         * If the credentials are not found, it logs a message and skips the chat initialization.
         * Otherwise, it connects the user to the StreamChat service using the retrieved credentials.
         * 
         * @async
         * @function initChat
         * @returns {Promise<void>} A promise that resolves when the chat client is initialized.
         * @throws {Error} If there is an error during the chat initialization process.
         */
        const initChat = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                const storedUserName = await AsyncStorage.getItem('userName');
                const storedStreamToken = await AsyncStorage.getItem('streamToken');

                if (!storedUserId || !storedStreamToken) {
                    console.log('No user credentials found, skipping chat init');
                    setLoadingClient(false);
                    return;
                }

                const client = StreamChat.getInstance(STREAM_API_KEY);

                await client.connectUser(
                    {
                        id: storedUserId,
                        name: storedUserName || 'NoName',
                    },
                    storedStreamToken
                );

                setUser({ id: storedUserId, name: storedUserName });
                setChatClient(client);
            } catch (error) {
                console.error('Error initializing chat:', error);
            } finally {
                setLoadingClient(false);
            }
        };

        initChat();

        return () => {
            if (chatClientRef.current) {
                chatClientRef.current.disconnectUser();
            }
        };
    }, []);

    return (
        <ChatContext.Provider
            value={{
                chatClient,
                setChatClient,
                channel,
                setChannel,
                thread,
                setThread,
                user,
                setUser,
            }}
        >
            <OverlayProvider>
                {children}
            </OverlayProvider>
        </ChatContext.Provider>
    );
};

export const useChatContext = () => React.useContext(ChatContext);
