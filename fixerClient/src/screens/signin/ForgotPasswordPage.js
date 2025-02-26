import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from "axios";
import { IPAddress } from '../../../ipAddress';

export default function ForgotPasswordPage({ navigation }) {
    const [email, setEmail] = useState('');
    const [isPinSent, setIsPinSent] = useState(false); // Track if PIN has been sent

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Email field is required');
            return;
        }

        try {
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/reset/requestPasswordReset`, { email });

            if (response.status === 200) {
                Alert.alert("Success", "Check your email for a PIN to reset your password");
                setIsPinSent(true); // Set the state to indicate the PIN has been sent
            }
        } catch (error) {
            if (error.response) {
                Alert.alert("Error", error.response.data.error || 'Failed to send reset PIN');
            } else {
                Alert.alert("Error", 'An unexpected error occurred');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                <Text style={styles.buttonText}>Send Reset PIN</Text>
            </TouchableOpacity>

            {isPinSent && (
                <TouchableOpacity onPress={() => navigation.navigate('EnterPin', { email })}>
                    <Text style={styles.pinText}>Enter PIN</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('SignInPage')}>
                <Text style={styles.signInText}>Back to Sign In</Text>
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
    pinText: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
    },
    signInText: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
    }
});
