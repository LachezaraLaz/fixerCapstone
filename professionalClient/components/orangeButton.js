import React, { useState, useRef } from 'react';
import { Pressable, Text, Animated, View } from 'react-native';
import colors from '../style/colors';
import styles from '../style/orangeButtonStyle';

const OrangeButton = ({ title, onPress, testID, variant = 'normal', style, disabled = false }) => {
    const [hovered, setHovered] = useState(false);
    const animatedValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!disabled) {
            Animated.timing(animatedValue, {
                toValue: 0.95, // Slight shrink effect
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (!disabled) {
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale: animatedValue }] }} testID={`${testID}-animated`}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={disabled ? undefined : onPress} // Ensures disabled prevents onPress
                testID={testID} // Ensure the testID is passed here
                // onMouseEnter={() => !disabled && setHovered(true)} // Works on web (optional)
                // onMouseLeave={() => !disabled && setHovered(false)} // Works on web (optional)
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor: disabled
                            ? colors.orange.disabled || '#cccccc' // Use a disabled color if provided, otherwise default to gray
                            : pressed
                                ? colors.orange[`${variant}Active`] || colors.orange.normal
                                : hovered
                                    ? colors.orange[`${variant}Hover`] || colors.orange.normal
                                    : colors.orange[variant] || colors.orange.normal,
                        opacity: disabled ? 0.6 : 1, // Reduce opacity when disabled
                    },
                    style,
                ]}
                disabled={disabled} // Disable the button
            >
                <Text style={[styles.text, disabled && styles.disabledText]}>{title}</Text>
            </Pressable>
        </Animated.View>
    );
};

export default OrangeButton;