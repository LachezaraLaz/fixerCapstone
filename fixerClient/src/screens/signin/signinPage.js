import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import OrangeButton from "../../../components/orangeButton";
import InputField  from '../../../components/inputField';
import PasswordField from '../../../components/passwordField';

import { IPAddress } from '../../../ipAddress';

export default function SignInPage({ navigation, setIsLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Both fields are required');
            return;
        }

        try {
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/client/signin/`, {
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

                setTimeout(() => {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "MainTabs" }],
                        })
                    );
                }, 100);

            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                Alert.alert("Error", error.response.data.statusText || 'Wrong email or password');
            } else if (error.response && error.response.status === 403) {
                Alert.alert('Please verify your email before logging in.');
            } else {
                Alert.alert("Error", 'An unexpected error occurred');
            }
        }
    };

    return (
        <View style={styles.container}>

            <TouchableOpacity style={styles.backButton} testID="back-button" onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#1E90FF" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title} testID='signInTitle'>Sign In</Text>

            {/* Email Field */}
            <InputField
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            {/* Password Field */}
            <PasswordField
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true} // Always hide password by default
            />

            <OrangeButton title="Sign In" onPress={handleSignIn} testID="sign-in-button" variant="normal" />
           
            <TouchableOpacity onPress={() => navigation.navigate('SignUpPage')}>
                <Text style={styles.signUpText}>Don't have an account? Sign up</Text>
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
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    signUpText: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
    },
});
