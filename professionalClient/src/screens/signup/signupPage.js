import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView  } from 'react-native';
import axios, {request} from 'axios';
import { IPAddress } from '../../../ipAddress';
import { Ionicons } from '@expo/vector-icons';

import OrangeButton from "../../../components/orangeButton";
import InputField from '../../../components/inputField';
import PasswordField from '../../../components/passwordField';
import CustomAlertError from '../../../components/customAlertError';
import CustomAlertSuccess from '../../../components/customAlertSuccess';

/**
 * @module professionalClient
 */

export default function SignUpPage({ navigation }) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    //const for custom alerts
    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertContent, setCustomAlertContent] = useState({ title: '', message: '' });
    const [successAlertVisible, setSuccessAlertVisible] = useState(false);
    const [successAlertContent, setSuccessAlertContent] = useState({ title: '', message: '' });
       
    //valid inputs or not
    const [isValid, setIsValid] = useState(false);
    const [isError, setIsError] = useState(false);

    // Password criteria states
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false)
    const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasLowercase && hasSpecialChar;

    // Show/hide password state
    const [showPassword, setShowPassword] = useState(false); // For password field

    // functions for input validation:
    //email
    // Function ot validate email
    const validateEmail = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (text === '') {
            setIsValid(false);
            setIsError(false);
        } else if (emailRegex.test(text)) {
            setIsValid(true);
            setIsError(false);
        } else {
            setIsValid(false);
            setIsError(true);
        }
        setEmail(text);
    };

    //password
    // Function to validate password strength
    const validatePassword = (password) => {
        setHasMinLength(password.length >= 8);
        setHasNumber(/\d/.test(password));
        setHasUppercase(/[A-Z]/.test(password));
        setHasLowercase(/[a-z]/.test(password));
        setHasSpecialChar(/[\W_]/.test(password)); // Special characters include anything that's not a letter or number
    };

    // Use useEffect to validate password whenever it changes
    useEffect(() => {
        validatePassword(password);
    }, [password])
    
    // Handle password input change
    const handlePasswordChange = (text) => {
        setPassword(text);
        validatePassword(text); // Validate password in real-time
    };

    // Handle confirm password input change
    const handleConfirmPasswordChange = (text) => {
        setConfirmPassword(text);
    };

    // Handle password and confirm password validation
    const validatePasswords = () => {
        return (
            hasMinLength &&
            hasNumber &&
            hasUppercase &&
            hasLowercase &&
            hasSpecialChar &&
            password === confirmPassword
        );
    };

    // first and last name fields validation
    const validateName = (name) => {
        if (!name) return false; // Name cannot be empty
        const nameRegex = /^[A-Za-z-' ]+$/; // Only letters, hyphens, apostrophes, and spaces
        return nameRegex.test(name) && name.charAt(0) === name.charAt(0).toUpperCase(); // First letter must be capitalized
    };

    const filterNameInput = (text) => {
        // Use a regular expression to allow only letters, hyphens, and apostrophes
        return text.replace(/[^A-Za-z-' ]/g, '');
    };
    

    /**
     * Handles the sign-up process for a new user.
     * 
     * This function performs the following steps:
     * 1. Validates that all required fields (email, password, confirmPassword) are filled.
     * 2. Checks if the password and confirmPassword fields match.
     * 3. Sends a POST request to the registration endpoint to create a new user account.
     * 4. Handles various error scenarios including user already exists, network errors, and unexpected errors.
     * 
     * @async
     * @function handleSignUp
     * @returns {Promise<void>} - A promise that resolves when the sign-up process is complete.
     */
    async function handleSignUp() {
        if (!email || !password || !confirmPassword) {
            setCustomAlertContent({
                title: "Error",
                message: "All fields are required",
                buttons: [
                  {
                    text: "OK",
                    onPress: () => setCustomAlertVisible(false)
                  }
                ]
            });              
            setCustomAlertVisible(true);
            return;
        }
        if (!isValid) {
            setCustomAlertContent({
                title: "Error",
                message: "Please enter a valid email address",
                buttons: [
                  {
                    text: "OK",
                    onPress: () => setCustomAlertVisible(false)
                  }
                ]
            });              
            setCustomAlertVisible(true);
            return;
        }
        if (!validatePasswords()) {
            setCustomAlertContent({
                title: "Error",
                message: "Password does not meet the required criteria",
                buttons: [
                  {
                    text: "OK",
                    onPress: () => setCustomAlertVisible(false)
                  }
                ]
            });              
            setCustomAlertVisible(true);
            return;
        }
        if (password !== confirmPassword) {
            setCustomAlertContent({
                title: "Error",
                message: "Passwords do not match",
                buttons: [
                  {
                    text: "OK",
                    onPress: () => setCustomAlertVisible(false)
                  }
                ]
            });              
            setCustomAlertVisible(true);
            return;
        }
        if (!validateName(firstName) || !validateName(lastName)) {
            setCustomAlertContent({
                title: "Error",
                message: "First name and last name must start with a capital letter",
                buttons: [
                  {
                    text: "OK",
                    onPress: () => setCustomAlertVisible(false)
                  }
                ]
            });              
            setCustomAlertVisible(true);
            return;
        }
        else {
            try {
                const response = await axios.post(`https://fixercapstone-production.up.railway.app/professional/register`, {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    password: password
                })
                if (response.status !== 400) {
                    setSuccessAlertContent({
                        title: "Account created successfully",
                        message: "An email was sent to verify your email.",
                    });
                    setSuccessAlertVisible(true);
                }
            } catch (error){
                if (error.response) {
                    // Check if the response indicates the user already exists
                    if (error.response.status === 400) {
                        setCustomAlertContent({
                            title: "Error",
                            message: "An account with this email already exists",
                            buttons: [
                              {
                                text: "OK",
                                onPress: () => setCustomAlertVisible(false)
                              }
                            ]
                        });                          
                        setCustomAlertVisible(true);
                    } else {
                        Alert.alert("Error", error.response.data.message || 'An unexpected error occurred');
                    }
                } else if (error.request) {
                    setCustomAlertContent({
                        title: "Error",
                        message: "Network error",
                        buttons: [
                          {
                            text: "OK",
                            onPress: () => setCustomAlertVisible(false)
                          }
                        ]
                    });                      
                    setCustomAlertVisible(true);
                } else {
                    setCustomAlertContent({
                        title: "Error",
                        message: "An unexpected error occurred",
                        buttons: [
                          {
                            text: "OK",
                            onPress: () => setCustomAlertVisible(false)
                          }
                        ]
                    });
                    setCustomAlertVisible(true);                      
                }
            }
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // adjust as needed
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flexGrow: 1, padding: 20, backgroundColor: '#ffffff'}}
                            contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
                            keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        <Text style={styles.title}>Sign Up</Text>

                        <InputField
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={(text) => setFirstName(filterNameInput(text))} // Filter invalid characters
                            autoCapitalize="words"
                        />

                        <InputField
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={(text) => setLastName(filterNameInput(text))} // Filter invalid characters
                        />

                        <InputField
                            placeholder="Email"
                            value={email}
                            onChangeText={validateEmail}
                            isValid={isValid}
                            isError={isError}
                            autoCapitalize="none"
                        />

                        {!isValid && email.length > 0 && (
                            <Text style={styles.errorText}>Please enter a valid email address</Text>
                        )}

                        {/* Password Field */}
                        <PasswordField
                            placeholder="Password"
                            value={password}
                            onChangeText={handlePasswordChange}
                            secureTextEntry={!showPassword}
                            isValid={isPasswordValid} // Green when all criteria are met
                            isError={!isPasswordValid && password.length > 0} // Red when criteria are not met
                        />

                        {/* Password Criteria */}
                        {password.length > 0 && (
                            <View style={styles.passwordCriteriaContainer}>
                                <Text style={[styles.criteriaText, hasMinLength && styles.criteriaMet]}>
                                    {hasMinLength ? '✓' : '•'} At least 8 characters
                                </Text>
                                <Text style={[styles.criteriaText, hasNumber && styles.criteriaMet]}>
                                    {hasNumber ? '✓' : '•'} At least one number
                                </Text>
                                <Text style={[styles.criteriaText, hasUppercase && styles.criteriaMet]}>
                                    {hasUppercase ? '✓' : '•'} At least one uppercase letter
                                </Text>
                                <Text style={[styles.criteriaText, hasLowercase && styles.criteriaMet]}>
                                    {hasLowercase ? '✓' : '•'} At least one lowercase letter
                                </Text>
                                <Text style={[styles.criteriaText, hasSpecialChar && styles.criteriaMet]}>
                                    {hasSpecialChar ? '✓' : '•'} At least one special character
                                </Text>
                            </View>
                        )}
            
                        {/* Confirm Password Field */}
                        <PasswordField
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={handleConfirmPasswordChange}
                            secureTextEntry={!showPassword}
                            isValid={confirmPassword === password && confirmPassword.length > 0} // Green when passwords match
                            isError={confirmPassword !== password && confirmPassword.length > 0} // Red when passwords do not match
                            errorMessage={confirmPassword !== password && confirmPassword.length > 0 ? "Passwords do not match" : null}
                        />

                        <OrangeButton title="Sign Up" onPress={handleSignUp} testID="sign-up-button" variant="normal" />
                              
                        <TouchableOpacity onPress={() => navigation.navigate('SignInPage')}>
                            <Text style={styles.signInText}>Already have an account? Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <CustomAlertError
                    visible={customAlertVisible}
                    title={customAlertContent.title}
                    message={customAlertContent.message}
                    buttons={customAlertContent.buttons}
                    onClose={() => setCustomAlertVisible(false)}
                />
                <CustomAlertSuccess
                    visible={successAlertVisible}
                    title={successAlertContent.title}
                    message={successAlertContent.message}
                    onClose={() => {
                        setSuccessAlertVisible(false);
                        // navigation.goBack(); // If you want to redirect after success
                    }}
                />
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 40,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 0,
        marginLeft: 10,
        marginBottom:20
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    signInText: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
        marginBottom: 100,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    backText: {
        marginLeft: 8,
        fontSize: 18,
        color: '#1E90FF',
    },
    passwordCriteriaContainer: {
        marginBottom: 15,
    },
    criteriaText: {
        color: 'gray',
        fontSize: 14,
    },
    criteriaMet: {
        color: 'green', // Green for met criteria
    },
});
