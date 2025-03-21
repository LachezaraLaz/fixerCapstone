import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ProfessionalAccountSettingsPage = () => {
    const navigation = useNavigation();

    // State for form data with placeholder values
    const [formData, setFormData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
    const [loading, setLoading] = useState(true);

    // Simulate loading profile data
    useEffect(() => {
        // Simulate API call delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData((prevState) => ({ ...prevState, [field]: value }));
    };

    // Simulate password validation
    const validateCurrentPassword = async () => {
        // For placeholder purposes, any password entered is considered valid
        if (formData.currentPassword) {
            setIsCurrentPasswordValid(true);
            Alert.alert("Success", "Current password validated. You can now set a new password.");
        } else {
            Alert.alert("Error", "Please enter your current password.");
        }
    };

    // Simulate saving changes
    const handleSaveChanges = async () => {
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }

        // Validate fields
        if (!formData.firstName || !formData.lastName) {
            Alert.alert('Error', 'First name and last name are required.');
            return;
        }

        // Simulate save delay
        setTimeout(() => {
            Alert.alert("Success", "Your changes have been saved.");
            setIsEditing(false);
        }, 1000);
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
                            <Text style={styles.label}>Current Password</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                value={formData.currentPassword}
                                onChangeText={(text) => handleInputChange('currentPassword', text)}
                                editable={isEditing}
                                placeholder="Enter current password to validate"
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
                                        placeholder="Enter new password"
                                    />
                                </View>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        secureTextEntry
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                        placeholder="Confirm new password"
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

export default ProfessionalAccountSettingsPage;