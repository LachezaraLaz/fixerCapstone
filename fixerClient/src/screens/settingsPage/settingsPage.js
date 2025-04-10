import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Modal, Animated, ActivityIndicator} from 'react-native';
import { useRoute} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LanguageContext } from "../../../context/LanguageContext";
import { I18n } from "i18n-js";
import { en, fr } from '../../../localization';
import style from '../../../style/homeScreenStyle';
import CustomAlertSuccess from '../../../components/customAlertSuccess';
import CustomAlertInfo from "../../../components/customAlertInfo";
import { useChatContext } from '../chat/chatContext';


/**
 * @module fixerClient
 */

export default function SettingsPage({ setIsLoggedIn, navigation }) {
    const route = useRoute();

    // Language context
    const {locale, setLocale} = useContext(LanguageContext);
    const { changeLanguage } = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    // Language selection state
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [successAlertVisible, setSuccessAlertVisible] = useState(false);

    //for customAlertSuccess
    const [successMessage, setSuccessMessage] = useState('');
    const [successTitle, setSuccessTitle] = useState('');

    //for customAlertInfo
    const [infoAlertVisible, setInfoAlertVisible] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [infoTitle, setInfoTitle] = useState('');

    // Logout animation
    const [loggingOut, setLoggingOut] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const { chatClient } = useChatContext();

    const showFeatureUnavailableAlert = (featureName) => {
        setInfoTitle(i18n.t('coming_soon'));

        if (featureName === "Appearance") {
            setInfoMessage(i18n.t('appearance_feature_message'));
        } else if (featureName === "Privacy Policy") {
            setInfoMessage(i18n.t('privacy_policy_coming_soon'));
        } else if (featureName === "Terms & Conditions") {
            setInfoMessage(i18n.t('terms_conditions_coming_soon'));
        }

        setInfoAlertVisible(true);
    };

    /**
     * Logs the user out by removing authentication tokens and user information from AsyncStorage.
     * Displays an alert indicating the success or failure of the logout process.
     *
     * @async
     * @function handleLogout
     * @returns {Promise<void>} A promise that resolves when the logout process is complete.
     */

    /**
     * Shows the language selection popup
     *
     * @function showLanguageSelection
     */
    const showLanguageSelection = () => {
        setLanguageModalVisible(true);
    };

    const handleLogout = async () => {
        try {
            // Start the logout process
            setLoggingOut(true);

            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();

            // Perform logout operations
            if (chatClient) {
                await chatClient.disconnectUser();
            }

            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('streamToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userName');

            // Delay for smooth transition
            setTimeout(() => {
                // Fade out before completing logout
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    // Finally set logged out state
                    setIsLoggedIn(false);
                });
            }, 800); // Delay for 800ms to show the message

        } catch (error) {
            console.error("Error logging out: ", error);
            setLoggingOut(false); // Reset state if error
            Alert.alert(i18n.t('error'), i18n.t('an_error_occurred_while_logging_out'));
        }
    };


    /**
     * Handles language change and shows success message
     *
     * @function handleLanguageChange
     * @param {string} newLanguage - The new language code to set
     */
    const handleLanguageChange = (newLanguage) => {
        if (newLanguage !== locale) {
            changeLanguage(newLanguage);

            // Close the language selection modal
            setLanguageModalVisible(false);

            // Set success message
            const title = newLanguage === 'en' ? 'Success' : 'Succès';
            const message = newLanguage === 'en'
                ? 'Language changed to English successfully!'
                : 'Langue changée en français avec succès!';

            setSuccessTitle(title);
            setSuccessMessage(message);

            // Show success alert after a short delay
            setTimeout(() => {
                setSuccessAlertVisible(true);
            }, 300); // Small delay to ensure modal is closed first
        } else {
            setLanguageModalVisible(false);
        }
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('ProfilePage'); // fallback
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity testID="settings-back-button" onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>{i18n.t('settings')}</Text>
                </View>
            </View>


            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('AccountSettingsPage')}>
                    <Text style={styles.optionText}>{i18n.t('edit_profile')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Appearance")}>
                    <Text style={styles.optionText}>{i18n.t('appearance')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={showLanguageSelection}>
                    <Text style={styles.optionText}>{i18n.t('language')}</Text>
                    <Text style={styles.optionValue}>{locale === 'en' ? 'English' : 'Français'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Privacy Policy")}>
                    <Text style={styles.optionText}>{i18n.t('privacy_policy')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Terms & Conditions")}>
                    <Text style={styles.optionText}>{i18n.t('terms_and_conditions')}</Text>
                </TouchableOpacity>

                <View style={style.logoutContainer}>
                    <TouchableOpacity style={style.logoutButton} onPress={handleLogout}>
                        <Text style={style.logoutText}>{i18n.t('logout')}</Text>
                    </TouchableOpacity>
                </View>


                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.</Text>
                </View>
            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                transparent
                animationType="fade"
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="language" size={40} color="#4BB543" style={{ marginBottom: 10 }} />
                            <Text style={styles.modalTitle}>{i18n.t('select_language') || 'Select Language'}</Text>
                            <Text style={styles.modalMessage}>{i18n.t('select_language_prompt') || 'Choose your preferred language:'}</Text>
                        </View>

                        <View style={styles.languageOptions}>
                            <TouchableOpacity
                                style={[styles.languageOption, locale === 'en' && styles.activeLanguageOption]}
                                onPress={() => handleLanguageChange('en')}
                            >
                                <Text style={[styles.languageOptionText, locale === 'en' && styles.activeLanguageOptionText]}>
                                    English
                                </Text>
                                {locale === 'en' && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.languageOption, locale === 'fr' && styles.activeLanguageOption]}
                                onPress={() => handleLanguageChange('fr')}
                            >
                                <Text style={[styles.languageOptionText, locale === 'fr' && styles.activeLanguageOptionText]}>
                                    Français
                                </Text>
                                {locale === 'fr' && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>{i18n.t('cancel') || 'Cancel'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Success Alert - Only shown after language change */}
            <CustomAlertSuccess
                visible={successAlertVisible}
                title={successTitle}
                message={successMessage}
                onClose={() => setSuccessAlertVisible(false)}
            />

            <CustomAlertInfo
                visible={infoAlertVisible}
                title={infoTitle}
                message={infoMessage}
                onClose={() => setInfoAlertVisible(false)}
            />

            {loggingOut && (
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: fadeAnim,
                        zIndex: 1000,
                    }}
                >
                    <ActivityIndicator size="large" color="#f28500" />
                    <Text style={{marginTop: 20, fontSize: 18, fontWeight: 'bold'}}>
                        {i18n.t('logging_out')}
                    </Text>
                </Animated.View>
            )}

        </SafeAreaView>
    );
}

const styles = {
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
        marginLeft: -28, // offset for back button if needed
    },
    container: {
        padding: 16,
    },
    option: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 18,
        color: '#333',
    },
    optionValue: {
        fontSize: 16,
        color: '#777',
    },
    logoutContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    logoutText: {
        fontSize: 18,
        color: '#fff',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#777',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4BB543',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 15,
        textAlign: 'center',
        color: '#333',
    },
    languageOptions: {
        width: '100%',
        marginBottom: 20,
    },
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    activeLanguageOption: {
        backgroundColor: '#4BB543',
    },
    languageOptionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    activeLanguageOptionText: {
        color: '#fff',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 14,
    },
};

