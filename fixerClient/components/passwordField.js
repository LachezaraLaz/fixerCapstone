import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from './inputField'; // Import the InputField component
import styles from '../style/passwordFieldStyle'; // Import styles for PasswordField

const PasswordField = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    isValid,
    isError,
    errorMessage,
}) => {
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    return (
        <View>
            <View style={styles.passwordContainer}>
                <InputField
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword state
                    style={styles.passwordInput} // Apply custom style for password input
                    isValid={isValid}
                    isError={isError}
                />
                <TouchableOpacity
                    testID="toggle-visibility"
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)} // Toggle password visibility
                >
                    <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'} // Change icon based on showPassword state
                        size={24}
                        color="#888"
                    />
                </TouchableOpacity>
            </View>
            {isError && errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
        </View>
    );
};

export default PasswordField;