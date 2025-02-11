import React, { useState, useRef } from 'react';
import { Pressable, Text, Animated, View } from 'react-native';
import colors from '../../fixerClient/style/colors'; // Import colors
import styles from '../style/orangeButtonStyle'; // Import styles from external file

const OrangeButton = ({ title, onPress, variant = 'normal', style }) => {
    const [hovered, setHovered] = useState(false);
    const animatedValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.timing(animatedValue, {
            toValue: 0.95, // Slight shrink effect
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
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                onMouseEnter={() => setHovered(true)} // Works on web (optional)
                onMouseLeave={() => setHovered(false)} // Works on web (optional)
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor: pressed
                            ? colors.orange[`${variant}Active`] || colors.orange.normal
                            : hovered
                                ? colors.orange[`${variant}Hover`] || colors.orange.normal
                                : colors.orange[variant] || colors.orange.normal,
                    },
                    style,
                ]}
            >
                <Text style={styles.text}>{title}</Text>
            </Pressable>
        </Animated.View>
    );
};

export default OrangeButton;
