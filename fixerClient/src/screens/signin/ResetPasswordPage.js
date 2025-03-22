import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { IPAddress } from '../../../ipAddress';
import {en, fr} from '../../../localization'
import { I18n } from "i18n-js";
import LanguageModal from "../../../components/LanguageModal";
import languageStyle from '../../../style/languageStyle';
import { LanguageContext } from "../../../context/LanguageContext";

/**
 * @module fixerClient
 */

export default function ResetPasswordPage({ route, navigation }) {
    const { email } = route.params; // Get the email from the previous page
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    let [modalVisible, setModalVisible] = useState(false);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    /**
     * Handles the password reset process.
     * 
     * This function performs the following steps:
     * 1. Checks if the new password and confirm password fields are filled.
     * 2. Ensures that the new password and confirm password match.
     * 3. Sends a POST request to the server to update the password.
     * 4. Displays appropriate alerts based on the success or failure of the operation.
     * 5. Navigates back to the sign-in page upon successful password reset.
     * 
     * @async
     * @function handleResetPassword
     * @returns {Promise<void>}
     */
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
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/reset/updatePassword`, { email, newPassword });

            if (response.status === 200) {
                Alert.alert('Success', 'Password has been reset successfully');
                navigation.navigate('SignInPage'); // Navigate back to sign in
            }
        } catch (error) {
            if (error.response) {
                Alert.alert('Error', error.response.data.error || 'Failed to reset password');
            } else {
                Alert.alert('Error', `${i18n.t('an_unexpected_error_occurred')}`);
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

            <TouchableOpacity style={styles.button} onPress={handleResetPassword} testID="reset-password-button">
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SignInPage')} testID="back-to-signin-button">
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
