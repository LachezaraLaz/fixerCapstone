import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Keyboard, Platform } from "react-native";
import { Channel, MessageList, MessageInput } from "stream-chat-expo";
import { useChatContext } from "./chatContext"; // Import AppContext hook

const ChatPage = () => {
    const { channel } = useChatContext(); // Get the selected channel from context
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const keyboardShowListener = Keyboard.addListener(showEvent, () => {
            setKeyboardVisible(true);
        });

        const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    if (!channel) {
        return (
            <View style={styles.centered}>
                <Text>No channel selected</Text>
            </View>
        );
    }

    return (
        <Channel channel={channel}>
            <View style={styles.container}>
                <MessageList />
                <View style={[styles.inputContainer, isKeyboardVisible && styles.inputContainerKeyboardActive]}>
                    <MessageInput />
                </View>
            </View>
        </Channel>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    inputContainer: {
        paddingBottom: 70, // Keeps space when keyboard is hidden
    },
    inputContainerKeyboardActive: {
        paddingBottom: 20, // Removes extra space when keyboard is open
    },
});

export default ChatPage;
