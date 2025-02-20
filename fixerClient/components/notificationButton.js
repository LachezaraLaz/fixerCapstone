import React, { useState, useRef } from 'react';
import { Pressable, Text, Animated, View } from 'react-native';
import styles from '../style/notificationButtonStyle';
import {Ionicons} from "@expo/vector-icons";

const NotificationButton = ({ onPress, icon = "notifications-outline", size = 24, color = "#333", testID }) => {
    const [hovered, setHovered] = useState(false);
    const animatedValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.timing(animatedValue, {
            toValue: 0.9, // Shrink effect
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
            <Pressable
                testID={testID}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                onMouseEnter={() => setHovered(true)} // Works on web
                onMouseLeave={() => setHovered(false)} // Works on web
                style={styles.notificationButton}
            >
                <Ionicons name="notifications-outline" size={size} color={color} />
            </Pressable>
        </Animated.View>
    );
};

export default NotificationButton;
