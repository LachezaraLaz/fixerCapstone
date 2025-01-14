import React from "react";
import { ChannelList } from "stream-chat-expo";
import { chatApiKey, chatUserId } from './chatConfig';
import { useChatContext } from './chatContext';

const ChannelListScreen = ({ navigation }) => {

    const { setChannel } = useChatContext();

    const handleSelectChannel = (channel) => {
        setChannel(channel);
        navigation.navigate("ChatPage");
    };

    const filters = {
        members: {
            '$in': [chatUserId]
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
