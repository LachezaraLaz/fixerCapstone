import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamChat } from "stream-chat";
import { OverlayProvider } from 'stream-chat-expo';
import { STREAM_API_KEY } from "./chatConfig";

/**
 * @module professionalClient
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
         * Initializes the chat client by retrieving stored user credentials and connecting to the StreamChat service.
         * 
         * @async
         * @function initChat
         * @returns {Promise<void>} A promise that resolves when the chat client is initialized.
         * @throws Will log an error message if there is an issue initializing the chat client.
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
