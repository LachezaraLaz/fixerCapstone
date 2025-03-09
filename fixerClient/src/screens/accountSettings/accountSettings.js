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
        address: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isOldPasswordValid, setIsOldPasswordValid] = useState(false);
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
                    address: response.data.address,
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
    };

    // Validate old password before allowing new password input
    const validateOldPassword = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Error", "Authentication failed.");
                return;
            }

            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/reset/updatePasswordWithOld`,
                { email: formData.email, oldPassword: formData.oldPassword, newPassword: formData.oldPassword }, // Just for validation
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setIsOldPasswordValid(true);
                Alert.alert("Success", "Old password validated. You can now set a new password.");
            }
        } catch (error) {
            setIsOldPasswordValid(false);
            Alert.alert("Error", "Old password is incorrect.");
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

            // Update profile information (excluding password)
            const updatedData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                address: formData.address,
            };

            await axios.put(
                `https://fixercapstone-production.up.railway.app/client/updateProfile`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // If the user validated old password and set a new one
            if (isOldPasswordValid && formData.newPassword) {
                const passwordData = {
                    email: formData.email,
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                };

                await axios.post(
                    `https://fixercapstone-production.up.railway.app/reset/updatePasswordWithOld`,
                    passwordData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            Alert.alert("Success", "Your changes have been saved.");
            setIsEditing(false);
        } catch (error) {
            console.error("Update error:", error);
            Alert.alert("Error", error.response?.data?.error || "Failed to update profile.");
        }
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

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={formData.address}
                                onChangeText={(text) => handleInputChange('address', text)}
                                editable={isEditing}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Old Password</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                value={formData.oldPassword}
                                onChangeText={(text) => handleInputChange('oldPassword', text)}
                                editable={isEditing}
                            />
                            <TouchableOpacity onPress={validateOldPassword} style={styles.validateButton}>
                                <Text style={styles.validateButtonText}>Validate</Text>
                            </TouchableOpacity>
                        </View>

                        {isOldPasswordValid && (
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
});

export default AccountSettingsPage;