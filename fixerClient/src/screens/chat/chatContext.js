import React, { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { chatApiKey, chatUserId, chatUserName, chatUserToken } from "./chatConfig";

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
        // Initialize Stream Chat client
        const client = StreamChat.getInstance(chatApiKey);

        const connectUser = async () => {
            await client.connectUser(
                {
                    id: chatUserId,
                    name: chatUserName,
                },
                chatUserToken
            );

            setUser({ id: chatUserId, name: chatUserName });
            setChatClient(client);
        };

        connectUser();

        return () => {
            client.disconnectUser();
        };
    }, []);

    return (
        <ChatContext.Provider
            value={{ chatClient, setChatClient, channel, setChannel, thread, setThread, user, setUser }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => React.useContext(ChatContext);
