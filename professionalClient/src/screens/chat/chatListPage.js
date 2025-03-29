import React from "react";
import { ChannelList } from "stream-chat-expo";
import { useChatContext } from './chatContext';
import {View, Text} from "react-native";

/**
 * @module professionalClient
 */

const ChannelListScreen = ({ navigation }) => {

    const { setChannel, user } = useChatContext();

    /**
     * Handles the selection of a chat channel.
     *
     * @param {Object} channel - The chat channel object to be selected.
     */
    const handleSelectChannel = (channel) => {
        setChannel(channel);
        navigation.navigate("ChatPage");
    };

    const filters = {
        members: {
            '$in': [ user?.id || '' ]
        },
    };

    const sort = {
        last_message_at: -1,
    };

    return (
        <>
            <View style={{
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 20,
                backgroundColor: '#fff',
            }}>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                }}>
                    Chats
                </Text>
            </View>
            <ChannelList
                onSelect={handleSelectChannel}
                filters={filters}
                sort={sort}
            />
        </>
    );
};

export default ChannelListScreen;
