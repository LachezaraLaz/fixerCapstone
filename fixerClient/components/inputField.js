import React, { useState, useRef } from 'react';
import { TextInput, Animated, View, Text } from 'react-native';
import colors from '../style/colors'; // Import colors
import styles from '../style/inputFieldStyle'; // Import styles from external file

const InputField = ({
    placeholder,
    value,
    onChangeText,
    isValid,
    isError,
    disabled = false, // New prop for disabled state
    secureTextEntry = false, // For password fields
    style,
}) => {
    const [focused, setFocused] = useState(false);
    const animatedValue = useRef(new Animated.Value(1)).current;

    const handleFocus = () => {
        if (!disabled) {
            setFocused(true);
            Animated.timing(animatedValue, {
                toValue: 1.05, // Slight zoom effect
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    };

    const handleBlur = () => {
        if (!disabled) {
            setFocused(false);
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    };

    // Determine border color based on validation state and focus
    let borderColor = '#ccc'; // Default border color
    if (isValid && value) {
        borderColor = colors.green.normal; // Green for valid input (only if value exists)
    } else if (isError && value) {
        borderColor = colors.red.normal; // Red for invalid input (only if value exists)
    } else if (focused) {
        borderColor = colors.orange.normal; // Orange when focused (only if not valid or error)
    }

    return (
        <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
            <View
                style={[
                    styles.inputContainer,
                    { borderColor },
                    disabled && styles.disabledInputContainer, // Apply disabled styles
                ]}
            >
                {/* Floating Label (Placeholder) */}
                {value && (
                    <Text style={[styles.floatingLabel, disabled && styles.disabledText]}>
                        {placeholder}
                    </Text>
                )}
                <TextInput
                    style={[
                        styles.input,
                        disabled && styles.disabledInput, // Apply disabled styles
                    ]}
                    placeholder={value ? '' : placeholder} // Hide placeholder if value exists
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={value}
                    onChangeText={onChangeText}
                    editable={!disabled} // Disable editing if disabled is true
                    secureTextEntry={secureTextEntry} // For password fields
                />
            </View>
        </Animated.View>
    );
};

export default InputField;