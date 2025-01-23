import  React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';  // Import icons
import { IPAddress } from '../../../ipAddress';

const ProfilePage = () => {
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    // Fetch the professional's profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setProfessional(response.data);
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

    if (!professional) {
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

    const handleVerifyCredentials = () => {
        navigation.navigate('CredentialFormPage');
    };

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>ProfilePage</Text>

                {/* Pencil Icon (Shows Alert When Tapped) */}
                <TouchableOpacity onPress={handleEditPress}>
                    <MaterialIcons name="edit" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Profile Details */}
            <View style={styles.header}>
                <Image source={require('../../../assets/profile.jpg')} style={styles.profileImage} />
                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{professional.firstName} {professional.lastName}</Text>
                    <Text style={styles.ratingText}>⭐ {professional.rating || 0}</Text>
                </View>
                <Text style={styles.emailText}>{professional.email}</Text>
            </View>

            {/* CONDITIONAL VIEWS BASED ON formComplete AND approved */}
            {!professional.formComplete ? (
                <Button title="Verify Credentials" onPress={handleVerifyCredentials} />
            ) : professional.approved ? (
                <Text style={styles.verifiedText}>Credentials Verified!</Text>
            ) : (
                <Text style={styles.waitingText}>Credential Verification Status: Waiting...</Text>
            )}

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
        justifyContent: 'space-between', // Space between back button, title, and edit button
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
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
    verifiedText: {
        fontSize: 20,
        color: 'green',
        marginTop: 20,
    },
    waitingText: {
        fontSize: 18,
        color: 'orange',
        marginTop: 20,
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

