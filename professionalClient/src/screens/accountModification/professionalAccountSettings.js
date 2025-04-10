import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertSuccess from "../../../components/customAlertSuccess";
import CustomAlertError from "../../../components/customAlertError";
import OrangeButton from "../../../components/orangeButton";
import InputField from "../../../components/inputField";
import axios from 'axios';

import { IPAddress } from '../../../ipAddress';

const ProfessionalAccountSettingsPage = () => {
    const navigation = useNavigation();

    // Password criteria states
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false);
    const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasLowercase && hasSpecialChar;

    // State for form data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // for Alerts
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

    const [isEditing, setIsEditing] = useState(false);
    const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [originalData, setOriginalData] = useState(null);

    // Fetch user profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    setErrorAlert({
                        visible: true,
                        title: "Error",
                        message: error.response?.data?.error || "Authentication failed"
                    });
                    return;
                }

                const response = await axios.get(
                    `https://fixercapstone-production.up.railway.app/professional/profile`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setFormData((prevState) => ({
                    ...prevState,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                }));
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setErrorAlert({
                    visible: true,
                    title: "Error",
                    message: "Failed to load profile data."
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const hasFormChanged = () => {
        if (!originalData) return false;

        // For basic fields, compare directly with original data
        const basicFieldsChanged =
            formData.firstName !== originalData.firstName ||
            formData.lastName !== originalData.lastName;

        // For password fields, check if they're filled and valid
        const passwordChanged =
            isCurrentPasswordValid &&
            formData.newPassword &&
            formData.confirmPassword &&
            formData.newPassword === formData.confirmPassword &&
            isPasswordValid; // Add password validation check here

        return basicFieldsChanged || passwordChanged;
    };



    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData((prevState) => ({ ...prevState, [field]: value }));
    };

    const validateCurrentPassword = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setErrorAlert({
                    visible: true,
                    title: "Error",
                    message: error.response?.data?.error || "Authentication failed."
                });
                return;
            }

            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/professional/reset/validateCurrentPassword`,
                { email: formData.email, currentPassword: formData.currentPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setIsCurrentPasswordValid(true);
                setSuccessAlert({
                    visible: true,
                    title: "Success",
                    message: "Current password validated. You can now set a new password.."
                });
            }
        } catch (error) {
            setIsCurrentPasswordValid(false);
            if (error.response) {
                setErrorAlert({
                    visible: true,
                    title: "Error",
                    message: error.response?.data?.error || "Incorrect password."
                });
            } else if (error.request) {
                setErrorAlert({
                    visible: true,
                    title: "Error",
                    message: error.response?.data?.error || "Network error. Please check your connection and try again."
                });
            } else {
                setErrorAlert({
                    visible: true,
                    title: "Error",
                    message: error.response?.data?.error || "Unexpected error occurred."
                });
            }
        }
    };

    // Function to validate password strength
    const validatePassword = (password) => {
        setHasMinLength(password.length >= 8);
        setHasNumber(/\d/.test(password));
        setHasUppercase(/[A-Z]/.test(password));
        setHasLowercase(/[a-z]/.test(password));
        setHasSpecialChar(/[\W_]/.test(password)); // Special characters include anything that's not a letter or number
    };

// Use useEffect to validate password whenever it changes
    useEffect(() => {
        if (formData.newPassword) {
            validatePassword(formData.newPassword);
        }
    }, [formData.newPassword]);

    // Save Changes API Call
    const handleSaveChanges = async () => {
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setErrorAlert({
                visible: true,
                title: "Error",
                message: "New passwords do not match."
            });
            return;
        }

        //new check for password complexity
        if (formData.newPassword && !isPasswordValid) {
            setErrorAlert({
                visible: true,
                title: "Error",
                message: "Password does not meet the required criteria."
            });
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setErrorAlert({
                    visible: true,
                    title: "Error",
                    message: "Authentication failed"
                });
                return;
            }

            // Send full profile update request
            const updatedData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
            };

            await axios.put(
                `https://fixercapstone-production.up.railway.app/professional/updateProfessionalProfile`,
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
                    `https://fixercapstone-production.up.railway.app/professional/reset/updatePasswordWithOld`,
                    passwordData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else if (!isCurrentPasswordValid && formData.newPassword) {
                setErrorAlert({
                    visible: true,
                    title: "Error",
                    message: error.response?.data?.error || "Please validate your current password before updating"
                });
                return;
            }
            setSuccessAlert({
                visible: true,
                title: "Success",
                message: "Your changes have been saved."
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Update error:", error);
            setErrorAlert({
                visible: true,
                title: "Error",
                message: error.response?.data?.error || "Failed to update profile."
            });
        }
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            // Entering edit mode - save current data as original
            setOriginalData({...formData});
        } else {
            // Exiting edit mode - reset password fields and validation state
            setFormData(prevState => ({
                ...prevState,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setIsCurrentPasswordValid(false);

            // Reset password criteria
            setHasMinLength(false);
            setHasNumber(false);
            setHasUppercase(false);
            setHasLowercase(false);
            setHasSpecialChar(false);
        }
        setIsEditing(!isEditing);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Profile</Text>

                {/* Edit Button */}
                <TouchableOpacity onPress={handleEditToggle}>
                    <MaterialIcons name="edit" size={24} color={isEditing ? 'gray' : 'black'} />
                </TouchableOpacity>
            </View>

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
                            <Text style={styles.label}>First Name</Text>
                            <InputField
                                value={formData.firstName}
                                onChangeText={(text) => handleInputChange('firstName', text)}
                                disabled={!isEditing}
                                showFloatingLabel={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <InputField
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={formData.lastName}
                                onChangeText={(text) => handleInputChange('lastName', text)}
                                disabled={!isEditing}
                                showFloatingLabel={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <InputField
                                style={styles.input}
                                secureTextEntry
                                value={formData.currentPassword}
                                onChangeText={(text) => handleInputChange('currentPassword', text)}
                                disabled={!isEditing}
                                showFloatingLabel={false}
                            />
                            {isEditing && (
                                <OrangeButton
                                    title="Validate"
                                    onPress={validateCurrentPassword}
                                    testID="validate-password-button"
                                    style={{marginTop: 10}}
                                />
                            )}
                        </View>

                        {isCurrentPasswordValid && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <InputField
                                        style={styles.input}
                                        secureTextEntry
                                        value={formData.newPassword}
                                        onChangeText={(text) => handleInputChange('newPassword', text)}
                                        disabled={!isEditing}
                                        showFloatingLabel={false}
                                        isValid={isPasswordValid && formData.newPassword.length > 0}
                                        isError={!isPasswordValid && formData.newPassword.length > 0}
                                    />
                                    {formData.newPassword.length > 0 && (
                                        <View style={styles.passwordCriteriaContainer}>
                                            <Text style={[styles.criteriaText, hasMinLength && styles.criteriaMet]}>
                                                {hasMinLength ? '✓' : '•'} At least 8 characters
                                            </Text>
                                            <Text style={[styles.criteriaText, hasNumber && styles.criteriaMet]}>
                                                {hasNumber ? '✓' : '•'} At least one number
                                            </Text>
                                            <Text style={[styles.criteriaText, hasUppercase && styles.criteriaMet]}>
                                                {hasUppercase ? '✓' : '•'} At least one uppercase letter
                                            </Text>
                                            <Text style={[styles.criteriaText, hasLowercase && styles.criteriaMet]}>
                                                {hasLowercase ? '✓' : '•'} At least one lowercase letter
                                            </Text>
                                            <Text style={[styles.criteriaText, hasSpecialChar && styles.criteriaMet]}>
                                                {hasSpecialChar ? '✓' : '•'} At least one special character
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <InputField
                                        style={styles.input}
                                        secureTextEntry
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                        showFloatingLabel={false}
                                        disabled={!isEditing}
                                    />
                                    {formData.newPassword && formData.confirmPassword && (
                                        <Text style={{
                                            color: formData.newPassword === formData.confirmPassword ? 'green' : 'red',
                                            marginTop: 5
                                        }}>
                                            {formData.newPassword === formData.confirmPassword
                                                ? "Passwords match ✓"
                                                : "Passwords don't match ✗"}
                                        </Text>
                                    )}
                                </View>
                            </>
                        )}

                        {isEditing && (
                            <OrangeButton
                                title="Save Changes"
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
    passwordCriteriaContainer: {
        marginBottom: 15,
    },
    criteriaText: {
        color: 'gray',
        fontSize: 14,
    },
    criteriaMet: {
        color: 'green',
    }
});

export default ProfessionalAccountSettingsPage;