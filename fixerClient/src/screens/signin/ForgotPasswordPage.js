import React, {useContext, useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from "axios";
import { IPAddress } from '../../../ipAddress';
import {en, fr} from '../../../localization'
import { I18n } from "i18n-js";
import LanguageModal from "../../../components/LanguageModal";
import languageStyle from '../../../style/languageStyle';
import { LanguageContext } from "../../../context/LanguageContext";
import {Ionicons} from "@expo/vector-icons";
import OrangeButton from "../../../components/orangeButton";
import InputField  from '../../../components/inputField';
import CustomAlertError from "../../../components/customAlertError";
import CustomAlertSuccess from "../../../components/customAlertSuccess";

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

    //For custom alerts
    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertContent, setCustomAlertContent] = useState({ title: '', message: '' });
    const [successAlertVisible, setSuccessAlertVisible] = useState(false);
    const [successAlertContent, setSuccessAlertContent] = useState({ title: '', message: '' });

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
            setCustomAlertContent({
                title: i18n.t('error'),
                message: i18n.t('forgot_password_missing_field'),
            });
            setCustomAlertVisible(true);
            return;
        }

        try {
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/reset/requestPasswordReset`, { email });

            if (response.status === 200) {
                setSuccessAlertContent({
                    title: i18n.t('success'),
                    message: i18n.t('forgot_password_success'),
                });
                setSuccessAlertVisible(true);
                setIsPinSent(true); // Set the state to indicate the PIN has been sent
            }
        } catch
            (error) {
            if (error.response) {
                setCustomAlertContent({
                    title: i18n.t('error'),
                    message: (error.response.data.error) ? i18n.t('forgot_password_no_account') : i18n.t('forgot_password_failed'),
                });
                setCustomAlertVisible(true);
            } else {
                setCustomAlertContent({
                    title: i18n.t('error'),
                    message: i18n.t('an_unexpected_error_occurred'),
                });
                setCustomAlertVisible(true);
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

            <TouchableOpacity style={styles.backButton} testID="back-button" onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="orange"/>
            </TouchableOpacity>

            <Text style={styles.title}>{i18n.t('forgot_password_no_question_mark')}</Text>

            <InputField
                style={styles.input}
                placeholder={i18n.t('email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <OrangeButton title={i18n.t('send_reset_pin')} onPress={handleForgotPassword} variant="normal" />

            {isPinSent && (
                <TouchableOpacity onPress={() => navigation.navigate('EnterPin', { email })}>
                    <Text style={styles.pinText}>{i18n.t('enter_pin')}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('SignInPage')}>
                <Text style={styles.signInText}>{i18n.t('sign_in')}</Text>
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
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
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
