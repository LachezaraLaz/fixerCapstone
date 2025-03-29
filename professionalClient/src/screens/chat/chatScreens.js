// ChatScreens.js
import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Chat } from "stream-chat-expo";
import { useChatContext } from "./chatContext";
import ChatListPage from "./chatListPage";
import ChatPage from "./chatPage";

const Stack = createNativeStackNavigator();

export default function ChatScreens() {
    const { chatClient } = useChatContext();

    if (!chatClient) {
        return null;
    }

    return (
        <Chat client={chatClient}>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="ChatListPage" component={ChatListPage} />
                <Stack.Screen name="ChatPage" component={ChatPage} />
            </Stack.Navigator>
        </Chat>
    );
}
