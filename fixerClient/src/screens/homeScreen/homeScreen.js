import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardComponent from '../cardComponent/CardComponent';
import { useEffect } from 'react';
import { useChatContext } from '../chat/chatContext';

export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const { chatClient } = useChatContext();

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

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
                <TouchableOpacity onPress={() => navigation.navigate('NotificationPage')} style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>



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

                {/* Create Issue Button*/}
                <View style={styles.createIssueSection}>
                    <TouchableOpacity style={styles.createIssueButton} onPress={() => navigation.navigate('CreateIssue')}>
                        <Text style={styles.createIssueButtonText}>Create Issue</Text>
                    </TouchableOpacity>
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
    notificationButton: {
        width: 40,
        height: 40,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
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
    createIssueButton: {
        backgroundColor: 'orange',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    createIssueButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
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
