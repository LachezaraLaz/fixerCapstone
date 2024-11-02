import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function ResetPasswordPage({ route, navigation }) {
    const { email } = route.params; // Get the email from the previous page
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://192.168.0.140:3000/reset/updatePassword', { email, newPassword });

            if (response.status === 200) {
                Alert.alert('Success', 'Password has been reset successfully');
                navigation.navigate('SignInPage'); // Navigate back to sign in
            }
        } catch (error) {
            if (error.response) {
                Alert.alert('Error', error.response.data.error || 'Failed to reset password');
            } else {
                Alert.alert('Error', 'An unexpected error occurred');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
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
