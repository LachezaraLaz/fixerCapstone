import React from "react";
import { ChannelList } from "stream-chat-expo";

const ChannelListScreen = ({ navigation }) => {
    const handleSelectChannel = (channel) => {
        navigation.navigate("Channel", { channelId: channel.id });
    };

    return (
        <ChannelList
            onSelect={handleSelectChannel}
        />
    );
};

export default ChannelListScreen;
