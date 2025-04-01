import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from "axios";
import { IPAddress } from '../../../ipAddress';
import {Ionicons} from "@expo/vector-icons";
import InputField from "../../../components/inputField";
import OrangeButton from "../../../components/orangeButton";
import CustomAlertError from "../../../components/customAlertError";
import CustomAlertSuccess from "../../../components/customAlertSuccess";

/**
 * @module professionalClient
 */

export default function ForgotPasswordPage({ navigation }) {
    const [email, setEmail] = useState('');
    const [isPinSent, setIsPinSent] = useState(false); // Track if PIN has been sent

    //For custom alerts
    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertContent, setCustomAlertContent] = useState({ title: '', message: '' });
    const [successAlertVisible, setSuccessAlertVisible] = useState(false);
    const [successAlertContent, setSuccessAlertContent] = useState({ title: '', message: '' });

    /**
     * Handles the forgot password process by sending a password reset request.
     * 
     * This function checks if the email field is filled. If not, it shows an alert indicating that the email field is required.
     * If the email field is filled, it sends a POST request to the server to request a password reset.
     * 
     * On a successful response (status 200), it shows a success alert and updates the state to indicate that the PIN has been sent.
     * If an error occurs, it shows an error alert with the appropriate message.
     * 
     * @async
     * @function handleForgotPassword
     * @returns {Promise<void>}
     */
    const handleForgotPassword = async () => {
        if (!email) {
            setCustomAlertContent({
                title: 'Error',
                message: 'Email field is required',
            });
            setCustomAlertVisible(true);
            return;
        }

        try {
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/reset/requestPasswordReset`, { email });

            if (response.status === 200) {
                setSuccessAlertContent({
                    title: 'Success',
                    message: "Check your email for a PIN to reset your password",
                });
                setSuccessAlertVisible(true);
                setIsPinSent(true); // Set the state to indicate the PIN has been sent
            }
        } catch (error) {
            if (error.response) {
                setCustomAlertContent({
                    title: 'Error',
                    message: 'Failed to send reset PIN',
                });
                setCustomAlertVisible(true)
            } else {
                setCustomAlertContent({
                    title: 'Error',
                    message: 'An unexpected error occurred',
                });
                setCustomAlertVisible(true)
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <TouchableOpacity style={styles.backButton} testID="back-button" onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="orange" />
            </TouchableOpacity>

            <InputField
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <OrangeButton title="Send Reset PIN" onPress={handleForgotPassword}/>

            {isPinSent && (
                <TouchableOpacity onPress={() => navigation.navigate('EnterPin', { email })}>
                    <Text style={styles.pinText}>Enter PIN</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('SignInPage')}>
                <Text style={styles.signInText}>Back to Sign In</Text>
            </TouchableOpacity>

            <CustomAlertError
                visible={customAlertVisible}
                title={customAlertContent.title}
                message={customAlertContent.message}
                onClose={() => setCustomAlertVisible(false)}
            />

            <CustomAlertSuccess
                visible={successAlertVisible}
                title={successAlertContent.title}
                message={successAlertContent.message}
                onClose={() => {
                    setSuccessAlertVisible(false);
                    navigation.navigate('EnterPin', { email });
                }}
            />
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
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
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
