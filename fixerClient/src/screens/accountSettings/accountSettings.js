import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LanguageContext } from "../../../context/LanguageContext";
import { useNavigation } from '@react-navigation/native';
import { I18n } from "i18n-js";
import { en, fr } from '../../../localization';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import OrangeButton from '../../../components/orangeButton';
import InputField from "../../../components/inputField";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomAlertSuccess from '../../../components/customAlertSuccess'
import CustomAlertError from '../../../components/customAlertError'

const AccountSettingsPage = () => {
    const navigation = useNavigation();

    // State for form data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        postalCode: '',
        provinceOrState: '',
        country: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [originalData, setOriginalData] = useState(null);

    //For address validation, to allow editing in input fields, and for current password validation
    const [isEditing, setIsEditing] = useState(false);
    const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
    const [addressValidated, setAddressValidated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Language context setup
    const { locale, changeLanguage } = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    //For CustomAlertSuccess and for CustomAlertError
    const [successAlert, setSuccessAlert] = useState({
        visible: false,
        title: '',
        message: ''
    });

    const [errorAlert, setErrorAlert] = useState({
        visible: false,
        title: '',
        message: ''
    });

    // Fetch user profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    setErrorAlert({
                        visible: true,
                        title: i18n.t('error'),
                        message: i18n.t('authentication_failed')
                    });

                    return;
                }

                const response = await axios.get(
                    `https://fixercapstone-production.up.railway.app/client/profile`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setFormData((prevState) => ({
                    ...prevState,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    street: response.data.street || '',
                    postalCode: response.data.postalCode || '',
                    provinceOrState: response.data.provinceOrState || 'QC',
                    country: response.data.country || 'Canada',
                }));
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setErrorAlert({
                    visible: true,
                    title: i18n.t('error'),
                    message: i18n.t('profile_data_failed_loading')
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData((prevState) => ({ ...prevState, [field]: value }));

        // Reset address validation when any address field changes
        if (['street', 'postalCode', 'provinceOrState', 'country'].includes(field)) {
            setAddressValidated(false);
        }

        // No need to explicitly call hasFormChanged() here as React will
        // re-render and evaluate the function in the button's disabled prop
    };

    // Verify Address Before Saving
    const handleVerifyAddress = async (silent=false) => {
        try {
            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/client/verifyAddress`,
                {
                    street: formData.street,
                    postalCode: formData.postalCode,
                    provinceOrState: formData.provinceOrState,
                    country: formData.country,
                }
            );

            if (response.data.isAddressValid) {
                // Fill in missing fields if available
                if (response.data.completeAddress) {
                    const complete = response.data.completeAddress;

                    // Create a new form data object with filled in fields
                    const newFormData = {
                        ...formData,
                        // Only update empty fields
                        postalCode: formData.postalCode || complete.postalCode || '',
                        provinceOrState: formData.provinceOrState || complete.provinceOrState || '',
                        country: formData.country || complete.country || ''
                    };

                    // Update the form state
                    setFormData(newFormData);
                }

                setAddressValidated(true);

                //only show success alert if not in silent mode
                if(!silent) {
                    setSuccessAlert({
                        visible: true,
                        title: i18n.t('success'),
                        message: i18n.t('address_verified_successfully')
                    });
                }
                return true;
            } else {
                setAddressValidated(false);
                setErrorAlert({
                    visible: true,
                    title: i18n.t('error'),
                    message: i18n.t('invalid_address')
                });
                return false;
            }
        } catch (error) {
            setAddressValidated(false);
            setErrorAlert({
                visible: true,
                title: i18n.t('error'),
                message: error.response?.data?.message || i18n.t('an_unexpected_error_occurred')
            });
            return false;
        }
    };

    const validateCurrentPassword = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setErrorAlert({
                    visible: true,
                    title: i18n.t('error'),
                    message: i18n.t('authentication_failed')
                });
                return;
            }

            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/reset/validateCurrentPassword`,
                { email: formData.email, currentPassword: formData.currentPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setIsCurrentPasswordValid(true);
                setSuccessAlert({
                    visible: true,
                    title: i18n.t('success'),
                    message: i18n.t('current_password_validated')
                });
            }
        } catch (error) {
            setIsCurrentPasswordValid(false);
            if (error.response.status === 401 && error.response.data?.error === 'Current password is incorrect') {
                setErrorAlert({
                    visible: true,
                    title: i18n.t('error'),
                    message: i18n.t('current_password_error')
                });
            } else if (error.request) {
                setErrorAlert({
                    visible: true,
                    title: i18n.t('error'),
                    message: i18n.t('network_error')
                });
            } else {
                setErrorAlert({
                    visible: true,
                    title: i18n.t('error'),
                    message: i18n.t('an_unexpected_error_occurred')
                });
            }
        }
    };

    // Save Changes API Call
    // Save Changes API Call
    const handleSaveChanges = async () => {
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setErrorAlert({
                visible: true,
                title: i18n.t('error'),
                message: i18n.t('new_passwords_match_error')
            });
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setErrorAlert({
                    visible: true,
                    title: i18n.t('error'),
                    message: i18n.t('authentication_failed')
                });
                return;
            }

            // For address validation, instead of calling handleVerifyAddress, logic is inlined
            // to avoid any potential race conditions with alerts
            let addressIsValid = true;
            if (formData.street || formData.postalCode) {
                try {
                    const addressResponse = await axios.post(
                        `https://fixercapstone-production.up.railway.app/client/verifyAddress`,
                        {
                            street: formData.street,
                            postalCode: formData.postalCode,
                            provinceOrState: formData.provinceOrState,
                            country: formData.country,
                        }
                    );

                    if (addressResponse.data.isAddressValid) {
                        // Fill in missing fields if available
                        if (addressResponse.data.completeAddress) {
                            const complete = addressResponse.data.completeAddress;
                            // Update formData with any filled-in fields
                            setFormData(prevState => ({
                                ...prevState,
                                postalCode: prevState.postalCode || complete.postalCode || '',
                                provinceOrState: prevState.provinceOrState || complete.provinceOrState || '',
                                country: prevState.country || complete.country || ''
                            }));
                        }
                        setAddressValidated(true);
                    } else {
                        addressIsValid = false;
                        setAddressValidated(false);
                        setErrorAlert({
                            visible: true,
                            title: i18n.t('error'),
                            message: i18n.t('invalid_address')
                        });
                        return; // Stop if address is invalid
                    }
                } catch (error) {
                    addressIsValid = false;
                    setAddressValidated(false);
                    setErrorAlert({
                        visible: true,
                        title: i18n.t('error'),
                        message: error.response?.data?.message || i18n.t('an_unexpected_error_occurred')
                    });
                    return; // Stop on error
                }
            }

            if (addressIsValid) {
                // If we get here, address validation passed or wasn't needed
                // Proceed with the rest of the update logic

                // Send full profile update request
                const updatedData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    street: formData.street,
                    postalCode: formData.postalCode,
                    provinceOrState: formData.provinceOrState,
                    country: formData.country,
                };

                await axios.put(
                    `https://fixercapstone-production.up.railway.app/client/updateProfile`,
                    updatedData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Only update password if it's changed
                if (isCurrentPasswordValid && formData.newPassword) {
                    const passwordData = {
                        email: formData.email,
                        currentPassword: formData.currentPassword,
                        newPassword: formData.newPassword,
                    };

                    await axios.post(
                        `https://fixercapstone-production.up.railway.app/reset/updatePasswordWithOld`,
                        passwordData,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } else if (!isCurrentPasswordValid && formData.newPassword) {
                    setErrorAlert({
                        visible: true,
                        title: i18n.t('error'),
                        message: i18n.t('validate_password_please')
                    });
                    return;
                }

                // Show success message and exit edit mode
                setSuccessAlert({
                    visible: true,
                    title: i18n.t('success'),
                    message: i18n.t('changes_saved')
                });
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Update error:", error);
            setErrorAlert({
                visible: true,
                title: i18n.t('error'),
                message: error.response?.data?.error || i18n.t('profile_update_error')
            });
        }
    };

    // Verification button for the address
    const AddressVerificationButton = () => {
        if (!isEditing) return null;

        return (
            <OrangeButton
                title={i18n.t('verify_address')}
                onPress={() => handleVerifyAddress(false)}
                testID="verify-address-button"
                style={{marginTop: 5}}
            />
        );
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            // Entering edit mode - save current data as original
            setOriginalData({...formData});
        }
        setIsEditing(!isEditing);
    };

    const hasFormChanged = () => {
        if (!originalData) return false;

        // For basic fields, compare directly with original data
        const basicFieldsChanged =
            formData.firstName !== originalData.firstName ||
            formData.lastName !== originalData.lastName ||
            formData.street !== originalData.street ||
            formData.postalCode !== originalData.postalCode ||
            formData.provinceOrState !== originalData.provinceOrState ||
            formData.country !== originalData.country;

        // For password fields, check if they're filled and valid
        const passwordChanged =
            isCurrentPasswordValid &&
            formData.newPassword &&
            formData.confirmPassword &&
            formData.newPassword === formData.confirmPassword;

        return basicFieldsChanged || passwordChanged;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            {/* Custom Header */}
            <View style={styles.header}>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="orange"
                    onPress={() => navigation.goBack()}
                />

                <Text style={styles.headerTitle}>{i18n.t('edit_profile')}</Text>

                {/* Edit Button */}
                <MaterialIcons
                    name="edit"
                    size={24}
                    color={isEditing ? 'gray' : 'black'}
                    onPress= {handleEditToggle}
                />
            </View>
            {/* Keyboard handling wrapper */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                >
            <ScrollView contentContainerStyle={styles.container}>
                {loading ? <Text>Loading...</Text> : (
                    <>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>{i18n.t('first_name')}</Text>
                            <InputField
                                value={formData.firstName}
                                onChangeText={(text) => handleInputChange('firstName', text)}
                                disabled={!isEditing}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>{i18n.t('last_name')}</Text>
                            <InputField
                                value={formData.lastName}
                                onChangeText={(text) => handleInputChange('lastName', text)}
                                disabled={!isEditing}
                            />
                        </View>

                        {/* Address Fields with Visual Indicators */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>{i18n.t('street')}</Text>
                            <View style={styles.inputContainer}>
                                <InputField
                                    value={formData.street}
                                    onChangeText={(text) => handleInputChange('street', text)}
                                    disabled={!isEditing}
                                    isValid={addressValidated}
                                />
                                {addressValidated && (
                                    <Ionicons name="checkmark-circle" size={24} color="green" style={styles.inputIcon} />
                                )}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>{i18n.t('postal_code')}</Text>
                            <View style={styles.inputContainer}>
                                <InputField
                                    value={formData.postalCode}
                                    onChangeText={(text) => handleInputChange('postalCode', text)}
                                    disabled={!isEditing}
                                    isValid={addressValidated}
                                />
                                {addressValidated && (
                                    <Ionicons name="checkmark-circle" size={24} color="green" style={styles.inputIcon} />
                                )}
                            </View>
                        </View>
{/*This part of the code is currently commented out since the app will only be used for Quebec and Canada. Kept for future expansion to other territories.*/}
                        {/*<View style={styles.formGroup}>*/}
                        {/*    <Text style={styles.label}>Province/State</Text>*/}
                        {/*    <View style={styles.inputContainer}>*/}
                        {/*        <TextInput*/}
                        {/*            style={[*/}
                        {/*                styles.inputWithIcon,*/}
                        {/*                !isEditing && styles.disabledInput,*/}
                        {/*                addressValidated && styles.validInput*/}
                        {/*            ]}*/}
                        {/*            value={formData.provinceOrState}*/}
                        {/*            onChangeText={(text) => handleInputChange('provinceOrState', text)}*/}
                        {/*            editable={isEditing}*/}
                        {/*        />*/}
                        {/*        {addressValidated && (*/}
                        {/*            <Ionicons name="checkmark-circle" size={24} color="green" style={styles.inputIcon} />*/}
                        {/*        )}*/}
                        {/*    </View>*/}
                        {/*</View>*/}

                        {/*<View style={styles.formGroup}>*/}
                        {/*    <Text style={styles.label}>Country</Text>*/}
                        {/*    <View style={styles.inputContainer}>*/}
                        {/*        <TextInput*/}
                        {/*            style={[*/}
                        {/*                styles.inputWithIcon,*/}
                        {/*                !isEditing && styles.disabledInput,*/}
                        {/*                addressValidated && styles.validInput*/}
                        {/*            ]}*/}
                        {/*            value={formData.country}*/}
                        {/*            onChangeText={(text) => handleInputChange('country', text)}*/}
                        {/*            editable={isEditing}*/}
                        {/*        />*/}
                        {/*        {addressValidated && (*/}
                        {/*            <Ionicons name="checkmark-circle" size={24} color="green" style={styles.inputIcon} />*/}
                        {/*        )}*/}
                        {/*    </View>*/}
                        {/*</View>*/}

                        {/* Address Verification Button */}
                        {isEditing && <AddressVerificationButton />}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>{i18n.t('current_password')}</Text>
                            <InputField
                                value={formData.currentPassword}
                                onChangeText={(text) => handleInputChange('currentPassword', text)}
                                disabled={!isEditing}
                                secureTextEntry={true}
                            />
                            {isEditing && (
                                <OrangeButton
                                    title={i18n.t('validate')}
                                    onPress={validateCurrentPassword}
                                    testID="validate-password-button"
                                    style={{marginTop: 10}}
                                />
                            )}
                        </View>

                        {isCurrentPasswordValid && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>{i18n.t('new_password')}</Text>
                                    <InputField
                                        value={formData.newPassword}
                                        onChangeText={(text) => handleInputChange('newPassword', text)}
                                        secureTextEntry={true}
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>{i18n.t('confirm_password')}</Text>
                                    <InputField
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                        secureTextEntry={true}
                                        isValid={formData.newPassword && formData.confirmPassword &&
                                            formData.newPassword === formData.confirmPassword}
                                        isError={formData.newPassword && formData.confirmPassword &&
                                            formData.newPassword !== formData.confirmPassword}
                                    />
                                    {formData.newPassword && formData.confirmPassword && (
                                        <Text style={{
                                            color: formData.newPassword === formData.confirmPassword ? 'green' : 'red',
                                            marginTop: 5
                                        }}>
                                            {formData.newPassword === formData.confirmPassword
                                                ? i18n.t('new_passwords_match')
                                                : i18n.t('new_passwords_mismatch')}
                                        </Text>
                                    )}
                                </View>
                            </>
                        )}

                        {isEditing && (
                            <OrangeButton
                                title={i18n.t('save_changes')}
                                onPress={handleSaveChanges}
                                testID="save-changes-button"
                                style={{
                                    marginTop: 20,
                                    opacity: hasFormChanged() ? 1 : 0.5,
                            }}
                                disabled={!hasFormChanged()}
                            />
                        )}
                    </>
                )}
            </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>

            <CustomAlertSuccess
                visible={successAlert.visible}
                title={successAlert.title}
                message={successAlert.message}
                onClose={() => setSuccessAlert({ ...successAlert, visible: false })}
            />
            <CustomAlertError
                visible={errorAlert.visible}
                title={errorAlert.title}
                message={errorAlert.message}
                onClose={() => setErrorAlert({ ...errorAlert, visible: false })}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        padding: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    formGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#777',
    },
    validateButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    validateButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: 'orange',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputWithIcon: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputIcon: {
        marginLeft: 10,
    },
    validInput: {
        borderColor: 'green',
    },
});

export default AccountSettingsPage;