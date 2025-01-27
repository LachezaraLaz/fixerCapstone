// __mocks__/stream-chat-expo.js
import React from 'react';
import { Text } from 'react-native';

// Provide simple mock implementations for the components
export const Channel = ({ children }) => <>{children}</>;
export const MessageList = () => <Text>MessageList</Text>;
export const MessageInput = () => <Text>MessageInput</Text>;