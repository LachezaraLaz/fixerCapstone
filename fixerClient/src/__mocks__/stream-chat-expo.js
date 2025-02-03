// __mocks__/stream-chat-expo.js
import React from 'react';
import { Text } from 'react-native';

export const Chat = ({ children }) => <>{children}</>;
export const Channel = ({ children }) => <>{children}</>;
export const MessageList = () => <Text>MessageList</Text>;
export const MessageInput = () => <Text>MessageInput</Text>;
export const OverlayProvider = ({ children }) => <>{children}</>;
