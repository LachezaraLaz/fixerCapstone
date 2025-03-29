import React, {useState, useEffect} from "react";
import {View, Text, StyleSheet, Keyboard, Platform, TouchableOpacity} from "react-native";
import { Channel, MessageList, MessageInput } from "stream-chat-expo";
import { useChatContext } from "./chatContext";
import {useNavigation} from "@react-navigation/native";
import {Ionicons} from "@expo/vector-icons"; // Import AppContext hook

const ChatPage = () => {
    const { channel, user } = useChatContext(); // Get the selected channel from context
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const navigation = useNavigation();

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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="orange" />
                    </TouchableOpacity>

                    <Text style={styles.title}>{user.name}</Text>
                </View>
                <MessageList />
                    <View style={isKeyboardVisible ? styles.inputContainerKeyboardActive : styles.inputContainer}>
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

    header: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        backgroundColor: '#fff',
        paddingTop: 10,
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },

    backButton: {
        position: 'absolute',
        left: 4,
        top:10,
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
        paddingBottom: 0, // Removes extra space when keyboard is open
    },
});

export default ChatPage;
