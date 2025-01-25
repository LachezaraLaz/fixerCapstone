import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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

    // Function to show alert when pencil icon is tapped
    const handleEditPress = () => {
        Alert.alert(
            "Feature Unavailable",
            "The editing feature is not available yet, but please keep an eye out for future updates!",
            [{ text: "OK", onPress: () => console.log("Alert closed") }]
        );
    };

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} accessibilityLabel="back button">
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>ProfilePage</Text>

                {/* Pencil Icon (Shows Alert When Tapped) */}
                <TouchableOpacity onPress={handleEditPress}  accessibilityLabel="edit button">
                    <MaterialIcons name="edit" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Profile Details */}
            <View style={styles.profileContainer}>
                <Image source={client.profilePicture} style={styles.profileImage} />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
