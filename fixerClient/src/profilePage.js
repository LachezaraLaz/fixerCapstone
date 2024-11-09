import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';  // To retrieve JWT

import { IPAddress } from '../ipAddress'; 

const ProfilePage = () => {
    const [client, setClient] = useState(null);  // State for client's data
    const [loading, setLoading] = useState(true);  // State to manage loading
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Get the JWT token from AsyncStorage
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    // Send request to the backend with the JWT token
                    const response = await axios.get(`https://fixercapstone-production.up.railway.app/client/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`  // Send JWT in Authorization header
                        }
                    });
                    setClient(response.data);  // Set client data
                } else {
                    console.error('No token found');
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);  // Set loading to false after data fetch
            }
        };

        fetchProfileData();
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;  // Show loading text while fetching
    }

    // const handleVerifyCredentials = () => {
    //     navigation.navigate('CredentialFormPage');  // Navigate to the credential form page
    // };

    if (!client) {
        return <Text>Error loading profile.</Text>;  // Handle error if profile is not found
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Profile Picture */}
                <Image source={client.profilePicture} style={styles.profileImage} />

                {/* Name and Rating */}
                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{client.name}</Text>
                    <Text style={styles.ratingText}>⭐ {client.rating}</Text>
                </View>

                {/* Email */}
                <Text style={styles.emailText}>{client.email}</Text>
            </View>

            {/* Help Button */}
            <View style={styles.section}>
                <Text style={styles.sectionText}>Help</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50, // Makes the image circular
        marginBottom: 16,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 18,
        color: '#FFD700',
    },
    emailText: {
        fontSize: 16,
        color: '#666666',
    },
    section: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    sectionText: {
        fontSize: 18,
        color: '#333333',
    },
});

export default ProfilePage;
