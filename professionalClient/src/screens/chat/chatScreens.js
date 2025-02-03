// ChatScreens.js
import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Chat } from "stream-chat-expo";
import { useChatContext } from "./chatContext"; // <-- your custom chat context
import ChatListPage from "./chatListPage";
import ChatPage from "./chatPage";

const Stack = createNativeStackNavigator();

export default function ChatScreens() {
    const { chatClient } = useChatContext(); // from your custom chat context

    if (!chatClient) {
        // If client isn't loaded yet, optionally return a loading component or just null.
        return null;
    }

    return (
        <Chat client={chatClient}>
            <Stack.Navigator>
                <Stack.Screen name="ChatListPage" component={ChatListPage} />
                <Stack.Screen name="ChatPage" component={ChatPage} />
            </Stack.Navigator>
        </Chat>
    );
}
