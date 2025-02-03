import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from "axios";
import { IPAddress } from '../../../ipAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInPage({ setIsLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Both fields are required');
            return;
        }

        try {
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/professional/signin/`, {
                email,
                password
            });

             if (response.status === 200) {
                 const { token, streamToken, userId, userName } = response.data;

                 // Store the token in AsyncStorage
                 await AsyncStorage.setItem('token', token);
                 await AsyncStorage.setItem('streamToken', streamToken);
                 await AsyncStorage.setItem('userId', userId);
                 await AsyncStorage.setItem('userName', userName);

                Alert.alert("Signed in successfully");
                setIsLoggedIn(true);
                navigation.navigate('MainTabs');
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                Alert.alert("Error", error.response.data.statusText || 'Wrong email or password');
            } else if(error.response.status === 403) {
                Alert.alert('Please verify your email before logging in.');
            } else {
                Alert.alert("Error", 'An unexpected error occurred');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>

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
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSignIn} testID={'sign-in-button'}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SignUpPage')}>
                <Text style={styles.signUpText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordPage')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
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
    signUpText: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
    },
    forgotPasswordText: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
    }
});
