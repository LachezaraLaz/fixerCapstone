import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardComponent from '../cardComponent/CardComponent';
import { useEffect } from 'react';
import { useChatContext } from '../chat/chatContext';
import OrangeButton from "../../../components/orangeButton";
import NotificationButton from "../../../components/notificationButton";
import SearchBar from "../../../components/searchBar";

/**
 * @module fixerClient
 */

export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const { chatClient } = useChatContext();

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    /**
     * Handles the user logout process.
     * 
     * This function performs the following steps:
     * 1. Disconnects the user from the chat client if it exists.
     * 2. Removes authentication and user-related data from AsyncStorage.
     * 3. Displays an alert indicating successful logout.
     * 4. Sets the login state to false.
     * 
     * If an error occurs during the process, it logs the error to the console and displays an error alert.
     * 
     * @async
     * @function handleLogout
     * @returns {Promise<void>} A promise that resolves when the logout process is complete.
     */
    const handleLogout = async () => {
        try {
            if (chatClient) {
                await chatClient.disconnectUser();
            }

            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('streamToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userName');

            Alert.alert('Logged out', 'You have been logged out successfully');
            setIsLoggedIn(false);
        } catch (error) {
            console.error("Error logging out: ", error);
            Alert.alert('Error', 'An error occurred while logging out');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.customHeader}>
                {/* Fixr Logo/Text */}
                <Text style={styles.headerLogo}>Fixr</Text>

                {/* Page Title */}
                <Text style={styles.headerTitle}>Home Screen</Text>

                {/* Notification Button */}
                <NotificationButton testID="notification-button" onPress={() => navigation.navigate('NotificationPage')} />
            </View>

            {/* Searchbar */}
            <SearchBar
                testID="search-button"
                onSearch={() => console.log("Search button pressed")}
                onFilter={() => console.log("Filter button pressed")}
                filterButtonTestID="filter-button"
            />

            <ScrollView contentContainerStyle={styles.container}>
                {/* Current Jobs Requested Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Jobs Requested</Text>
                    <CardComponent title="Plumbing Repair" status="In Progress" professionalName="John Doe" />
                    <CardComponent title="Electrical Work" status="Pending" professionalName="Jane Smith" />
                </View>

                {/* Outstanding Payments Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Outstanding Payments</Text>
                    <CardComponent title="Invoice #1234" status="Overdue" showProgress={false} showProfessional={false} />
                    <CardComponent title="Invoice #5678" status="Due Soon" showProgress={false} showProfessional={false} />
                </View>

                {/* Create Issue Button */ }
                <View>
                    <OrangeButton title="Create Issue" onPress={() => navigation.navigate('CreateIssue')} variant="normal" />
                </View>

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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    customHeader: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerLogo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'orange',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
    },
    section: {
        marginBottom: 24,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    createIssueSection: {
        paddingHorizontal: 16,
        marginVertical: 16,
        width: '100%',
    },
    logoutContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
        width: '100%',
    },
    logoutButton: {
        backgroundColor: '#ffdddd',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#d9534f',
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        marginTop: 16,
        width: '100%',
    },
    footerText: {
        fontSize: 12,
        color: '#666',
    },
});
