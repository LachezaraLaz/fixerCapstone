import React, {useContext, useState} from 'react';
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

export default function EnterPinPage({ route, navigation }) {
    const { email } = route.params; // Get the email from the previous page
    const [pin, setPin] = useState('');
    let [modalVisible, setModalVisible] = useState(false);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    /**
     * Handles the submission of the PIN.
     * 
     * This function validates the PIN input and sends a request to the server to validate the PIN.
     * If the PIN is valid, it navigates to the password reset page.
     * If the PIN is invalid or an error occurs, it displays an appropriate error message.
     * 
     * @async
     * @function handlePinSubmit
     * @returns {Promise<void>}
     */
    const handlePinSubmit = async () => {
        if (!pin) {
            Alert.alert('Error', 'PIN field is required');
            return;
        }

        try {
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/reset/validatePin`, { email, pin: pin.toString() });

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
            <TouchableOpacity onPress={() => setModalVisible(true)} style={languageStyle.languageButton}>
                <Text style={languageStyle.languageButtonText}>🌍 {i18n.t('change_language')}</Text>
            </TouchableOpacity>

            <LanguageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                setLocale={setLocale}
            />
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
