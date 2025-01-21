// ChatPage.js
import React from "react";
import { View, Text } from "react-native";
import { Channel, MessageList, MessageInput } from "stream-chat-expo";
import { useChatContext } from "./chatContext"; // Import AppContext hook

const ChatPage = () => {
    const { channel } = useChatContext(); // Get the selected channel from context

    if (!channel) {
        return <View><Text>No channel selected</Text></View>; // Fallback if no channel is selected
    }

    return (
        <Channel channel={channel}>
            <View style={{ flex: 1 }}>
                <MessageList />
                <MessageInput />
            </View>
        </Channel>
    );
};

export default ChatPage;
