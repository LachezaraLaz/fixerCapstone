import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * @module professionalClient
 */

export default function SettingsPage() {
    const navigation = useNavigation();

    // Function to show "Feature Not Available" alert
    const showFeatureUnavailableAlert = (featureName) => {
        Alert.alert("Feature Unavailable", `${featureName} is not available yet.`);
    };

    /**
     * Handles the user logout process by removing stored tokens and user information from AsyncStorage.
     * Displays an alert to inform the user of the logout status.
     * 
     * @async
     * @function handleLogout
     * @returns {Promise<void>} A promise that resolves when the logout process is complete.
     * @throws Will display an alert if an error occurs during the logout process.
     */
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('streamToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userName');

            Alert.alert('Logged out', 'You have been logged out successfully');
        } catch (error) {
            console.error("Error logging out: ", error);
            Alert.alert('Error', 'An error occurred while logging out');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} testID="back-button">
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Account Settings")}>
                    <Text style={styles.optionText}>Account Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Appearance")}>
                    <Text style={styles.optionText}>Appearance</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Language")}>
                    <Text style={styles.optionText}>Language</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Wallet")}>
                    <Text style={styles.optionText}>Wallet</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Notifications")}>
                    <Text style={styles.optionText}>Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("View Tax Documents")}>
                    <Text style={styles.optionText}>View Tax Documents</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Privacy Policy")}>
                    <Text style={styles.optionText}>Privacy Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Terms & Conditions")}>
                    <Text style={styles.optionText}>Terms & Conditions</Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.</Text>
                </View>
            </ScrollView>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    container: {
        padding: 16,
    },
    option: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    optionText: {
        fontSize: 18,
        color: '#333',
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
};
