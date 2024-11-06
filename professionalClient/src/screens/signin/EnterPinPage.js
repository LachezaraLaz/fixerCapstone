import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { IPAddress } from '../../../ipAddress';

export default function EnterPinPage({ route, navigation }) {
    const { email } = route.params; // Get the email from the previous page
    const [pin, setPin] = useState('');

    const handlePinSubmit = async () => {
        if (!pin) {
            Alert.alert('Error', 'PIN field is required');
            return;
        }

        try {
            const response = await axios.post(`http://${IPAddress}:3000/reset/validatePin`, { email, pin: pin.toString() });

            if (response.status === 200) {
                Alert.alert('Success', 'PIN validated successfully');
                // Navigate to the password reset page
                navigation.navigate('ResetPasswordPage', { email });
            }
        } catch (error) {
            if (error.response) {
                Alert.alert('Error', error.response.data.error || 'Invalid or expired PIN');
            } else {
                Alert.alert('Error', 'An unexpected error occurred');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter PIN</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter your PIN"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handlePinSubmit}>
                <Text style={styles.buttonText}>Validate PIN</Text>
            </TouchableOpacity>

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
    signInText: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
    }
});
