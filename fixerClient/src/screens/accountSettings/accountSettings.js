import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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

    const [isEditing, setIsEditing] = useState(false);
    const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
    const [addressValidated, setAddressValidated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch user profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    Alert.alert("Error", "Authentication failed.");
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
                    provinceOrState: response.data.provinceOrState || '',
                    country: response.data.country || '',
                }));
            } catch (error) {
                console.error("Error fetching profile data:", error);
                Alert.alert("Error", "Failed to load profile data.");
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
    };

    // Verify Address Before Saving
    const handleVerifyAddress = async () => {
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
                setAddressValidated(true);
                Alert.alert("Success", "Address verified successfully.");
                return true;
            } else {
                setAddressValidated(false);
                Alert.alert("Error", "Invalid address. Please enter a valid address.");
                return false;
            }
        } catch (error) {
            setAddressValidated(false);
            Alert.alert("Error", error.response?.data?.message || "An unexpected error occurred.");
            return false;
        }
    };

    const validateCurrentPassword = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Error", "Authentication failed.");
                return;
            }

            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/reset/validateCurrentPassword`,
                { email: formData.email, currentPassword: formData.currentPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setIsCurrentPasswordValid(true);
                Alert.alert("Success", "Current password validated. You can now set a new password.");
            }
        } catch (error) {
            setIsCurrentPasswordValid(false);
            if (error.response) {
                Alert.alert("Error", error.response.data?.error || "Incorrect password.");
            } else if (error.request) {
                Alert.alert("Error", "Network error. Please check your connection and try again.");
            } else {
                Alert.alert("Error", "Unexpected error occurred.");
            }
        }
    };

    // Save Changes API Call
    const handleSaveChanges = async () => {
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Error", "Authentication failed.");
                return;
            }

            // Always verify address if any address fields are filled
            if (formData.street || formData.postalCode) {
                const isAddressVerified = await handleVerifyAddress();
                if (!isAddressVerified) {
                    return; // Stop if address is invalid
                }
            }

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
                Alert.alert("Error", "Please validate your current password before updating.");
                return;
            }

            Alert.alert("Success", "Your changes have been saved.");
            setIsEditing(false);
        } catch (error) {
            console.error("Update error:", error);
            Alert.alert("Error", error.response?.data?.error || "Failed to update profile.");
        }
    };

    // Add a verification button for the address
    const AddressVerificationButton = () => {
        if (!isEditing) return null;

        return (
            <TouchableOpacity
                style={[styles.validateButton, {marginTop: 5}]}
                onPress={handleVerifyAddress}
            >
                <Text style={styles.validateButtonText}>Verify Address</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Account Settings</Text>

                {/* Edit Button */}
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                    <MaterialIcons name="edit" size={24} color={isEditing ? 'gray' : 'black'} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {loading ? <Text>Loading...</Text> : (
                    <>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={formData.firstName}
                                onChangeText={(text) => handleInputChange('firstName', text)}
                                editable={isEditing}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={formData.lastName}
                                onChangeText={(text) => handleInputChange('lastName', text)}
                                editable={isEditing}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={formData.email}
                                editable={false}
                            />
                        </View>

                        {/* Address Fields with Visual Indicators */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Street</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.inputWithIcon,
                                        !isEditing && styles.disabledInput,
                                        addressValidated && styles.validInput
                                    ]}
                                    value={formData.street}
                                    onChangeText={(text) => handleInputChange('street', text)}
                                    editable={isEditing}
                                />
                                {addressValidated && (
                                    <Ionicons name="checkmark-circle" size={24} color="green" style={styles.inputIcon} />
                                )}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Postal Code</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.inputWithIcon,
                                        !isEditing && styles.disabledInput,
                                        addressValidated && styles.validInput
                                    ]}
                                    value={formData.postalCode}
                                    onChangeText={(text) => handleInputChange('postalCode', text)}
                                    editable={isEditing}
                                />
                                {addressValidated && (
                                    <Ionicons name="checkmark-circle" size={24} color="green" style={styles.inputIcon} />
                                )}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Province/State</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.inputWithIcon,
                                        !isEditing && styles.disabledInput,
                                        addressValidated && styles.validInput
                                    ]}
                                    value={formData.provinceOrState}
                                    onChangeText={(text) => handleInputChange('provinceOrState', text)}
                                    editable={isEditing}
                                />
                                {addressValidated && (
                                    <Ionicons name="checkmark-circle" size={24} color="green" style={styles.inputIcon} />
                                )}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Country</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.inputWithIcon,
                                        !isEditing && styles.disabledInput,
                                        addressValidated && styles.validInput
                                    ]}
                                    value={formData.country}
                                    onChangeText={(text) => handleInputChange('country', text)}
                                    editable={isEditing}
                                />
                                {addressValidated && (
                                    <Ionicons name="checkmark-circle" size={24} color="green" style={styles.inputIcon} />
                                )}
                            </View>
                        </View>

                        {/* Address Verification Button */}
                        {isEditing && <AddressVerificationButton />}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                value={formData.currentPassword}
                                onChangeText={(text) => handleInputChange('currentPassword', text)}
                                editable={isEditing}
                            />
                            {isEditing && (
                                <TouchableOpacity onPress={validateCurrentPassword} style={styles.validateButton}>
                                    <Text style={styles.validateButtonText}>Validate</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {isCurrentPasswordValid && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        secureTextEntry
                                        value={formData.newPassword}
                                        onChangeText={(text) => handleInputChange('newPassword', text)}
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        secureTextEntry
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => handleInputChange('confirmPassword', text)}
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
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </ScrollView>
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