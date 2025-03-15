import React from "react";
import { ChannelList } from "stream-chat-expo";
import { useChatContext } from './chatContext';
/**
 * @module fixerClient
 */

const ChannelListScreen = ({ navigation }) => {

    const { setChannel, user } = useChatContext();

    /**
     * Handles the selection of a chat channel.
     *
     * @param {Object} channel - The selected chat channel object.
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
        <ChannelList
            onSelect={handleSelectChannel}
            filters={filters}
            sort={sort}
        />
    );
};

export default ChannelListScreen;
