import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardComponent from './CardComponent';
import { useEffect } from 'react';
import { useChatContext } from './screens/chat/chatContext';

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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('ProfilePage')}>
                    <Ionicons name="person-circle" size={32} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('NotificationPage')}>
                    <Ionicons name="notifications-outline" size={28} color="#333" />
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

                {/* Help Button */}
                <View style={styles.helpSection}>
                    <TouchableOpacity style={styles.helpButton}>
                        <Text style={styles.helpButtonText}>Help</Text>
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
    header: {
        width: '100%',
        height: 70, // Adjusted height for better alignment
        paddingHorizontal: 16,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end', // Align icons towards the bottom of the header
        paddingBottom: 8,
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
    helpSection: {
        paddingHorizontal: 16,
        marginVertical: 16,
        width: '100%',
    },
    helpButton: {
        backgroundColor: '#e0e0e0',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    helpButtonText: {
        fontSize: 16,
        color: '#333',
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

