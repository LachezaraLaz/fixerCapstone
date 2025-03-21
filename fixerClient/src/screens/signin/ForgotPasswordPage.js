import React, {useContext, useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from "axios";
import { IPAddress } from '../../../ipAddress';
import {en, fr} from '../../../localization'
import { I18n } from "i18n-js";
import LanguageModal from "../../../components/LanguageModal";
import languageStyle from '../../../style/languageStyle';
import { LanguageContext } from "../../../context/LanguageContext";

/**
 * @module fixerClient
 */

export default function ForgotPasswordPage({ navigation }) {
    const [email, setEmail] = useState('');
    const [isPinSent, setIsPinSent] = useState(false); // Track if PIN has been sent
    let [modalVisible, setModalVisible] = useState(false);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    /**
     * Handles the forgot password process by sending a password reset request to the server.
     * If the email field is empty, it alerts the user that the email field is required.
     * If the request is successful, it alerts the user to check their email for a PIN to reset their password.
     * If the request fails, it alerts the user with the appropriate error message.
     *
     * @async
     * @function handleForgotPassword
     * @returns {Promise<void>}
     */
    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Email field is required');
            return;
        }

        try {
            const response = await axios.post(`http://192.168.1.143:3000/reset/requestPasswordReset`, { email });

            if (response.status === 200) {
                Alert.alert("Success", "Check your email for a PIN to reset your password");
                setIsPinSent(true); // Set the state to indicate the PIN has been sent
            }
        } catch (error) {
            if (error.response) {
                Alert.alert("Error", error.response.data.error || 'Failed to send reset PIN');
            } else {
                Alert.alert("Error", `${i18n.t('an_unexpected_error_occurred')}`);
            }
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={languageStyle.languageButton}>
                <Text style={languageStyle.languageButtonText}>🌍 {i18n.t('change_language')}</Text>
            </TouchableOpacity>

            <LanguageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                setLocale={setLocale}
            />
            <Text style={styles.title}>{i18n.t('forgot_password_no_question_mark')}</Text>

            <TextInput
                style={styles.input}
                placeholder={i18n.t('email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                <Text style={styles.buttonText}>{i18n.t('send_reset_pin')}</Text>
            </TouchableOpacity>

            {isPinSent && (
                <TouchableOpacity onPress={() => navigation.navigate('EnterPin', { email })}>
                    <Text style={styles.pinText}>{i18n.t('enter_pin')}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('SignInPage')}>
                <Text style={styles.signInText}>{i18n.t('sign_in')}</Text>
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
