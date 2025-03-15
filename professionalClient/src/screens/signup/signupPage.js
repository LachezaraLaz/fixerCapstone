import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios, {request} from 'axios';
import { IPAddress } from '../../../ipAddress';

/**
 * @module professionalClient
 */

export default function SignUpPage({ navigation }) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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
            Alert.alert('Error', 'All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        } else {
            try {
                const response = await axios.post(`https://fixercapstone-production.up.railway.app/professional/register`, {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    password: password
                })
                if (response.status !== 400) {
                    Alert.alert("Account created successfully. An email was sent to verify your email.")
                }
            } catch (error){
                if (error.response) {
                    // Check if the response indicates the user already exists
                    if (error.response.status === 400) {
                        Alert.alert("Error", "Account already exists");
                    } else {
                        Alert.alert("Error", error.response.data.message || 'An unexpected error occurred');
                    }
                } else if (error.request) {
                    Alert.alert("Error", "Network error");
                } else {
                    Alert.alert("Error", "An unexpected error occurred");
                }
            }
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={() => handleSignUp()} testID={'sign-up-button'}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SignInPage')}>
                <Text style={styles.signInText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
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
    },
});
