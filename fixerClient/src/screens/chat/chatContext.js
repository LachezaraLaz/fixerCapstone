import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamChat } from "stream-chat";
import { STREAM_API_KEY } from "./chatConfig";

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

    useEffect(() => {
        const initChat = async () => {
            try {

                const storedUserId = await AsyncStorage.getItem('userId');
                const storedUserName = await AsyncStorage.getItem('userName');
                const storedStreamToken = await AsyncStorage.getItem('streamToken');

                console.log(storedUserId);

                if (!storedUserId || !storedStreamToken) {
                    console.log('No user credentials found, skipping chat init');
                    return;
                }

                // Create a single instance of the Stream client
                const client = StreamChat.getInstance(STREAM_API_KEY);

                // Connect user with the retrieved credentials
                await client.connectUser(
                    {
                        id: storedUserId,
                        name: storedUserName || 'NoName',
                    },
                    storedStreamToken
                );

                // Update state
                setUser({ id: storedUserId, name: storedUserName });
                setChatClient(client);
            } catch (error) {
                console.error('Error initializing chat:', error);
            }
        };

        initChat();

        // Cleanup on unmount or user switch
        return () => {
            if (chatClient) {
                console.log("Byeeee");
                chatClient.disconnectUser();
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
                setUser
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => React.useContext(ChatContext);
