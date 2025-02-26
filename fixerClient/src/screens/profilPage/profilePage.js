import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ProfilePage = () => {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const response = await axios.get(
                        `https://fixercapstone-production.up.railway.app/client/profile`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setClient(response.data);
                } else {
                    console.error('No token found');
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (!client) {
        return <Text>Error loading profile.</Text>;
    }

    return (
        <View style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.customHeader}>
                <Text style={styles.headerLogo}>Fixr</Text>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    accessibilityLabel="settings button"
                    onPress={() => navigation.navigate('SettingsPage')}
                    style={styles.settingsButton}
                >
                    <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Profile Details */}
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: client.profilePicture || 'https://via.placeholder.com/100' }}
                    style={styles.profileImage}
                />
                <Text style={styles.emailText}>{client.email}</Text>
            </View>

            {/* Help Button */}
            <View style={styles.helpContainer}>
                <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpButtonText}>Help</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

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
    settingsButton: {
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
    profileContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: '#e0e0e0',
    },
    emailText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666666',
        marginTop: 8,
    },
    helpContainer: {
        marginTop: 20,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    helpButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    helpButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default ProfilePage;
