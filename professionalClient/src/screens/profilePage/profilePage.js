import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ProfilePage = () => {
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

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

    const handleViewReviews = () => {
        navigation.navigate('ReviewsPage', { professionalEmail: professional.email });
    };

    if (!professional) {
        return <Text>Error loading profile.</Text>;
    }

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
                <TouchableOpacity onPress={handleEditPress} testID="edit-button">
                    <MaterialIcons name="edit" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Profile Details Section */}
            <View style={styles.profileContainer}>
                {/* Profile Picture */}
                <Image source={require('../../../assets/profile.jpg')} style={styles.profileImage} />

                {/* Name & Rating */}
                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{professional.firstName} {professional.lastName}</Text>
                    <Text style={styles.ratingText}>⭐ {professional.totalRating || 0} </Text>
                    <Text style={styles.emailText}> ({professional.reviewCount} reviews)</Text>
                </View>

                {/* Email */}
                <Text style={styles.emailText}>{professional.email}</Text>
            </View>

            {/* CONDITIONAL VIEWS BASED ON formComplete AND approved */}
            {!professional.formComplete ? (
                // First view: Form not completed
                <View style={styles.buttonContainer}>
                    <Button title="Verify Credentials" onPress={handleVerifyCredentials} />
                </View>
            ) : professional.approved ? (
                <Text style={styles.verifiedText}>Credentials Verified!</Text>
            ) : (
                <Text style={styles.waitingText}>Credential Verification Status: Waiting...</Text>
            )}

            {/* Button to View Reviews */}
            <View style={styles.buttonContainer}>
                <Button title="View Reviews" onPress={handleViewReviews} />
            </View>

            {/* Help Button  */}
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
        alignItems: 'center', // Ensure everything is centered
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
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
        width: '100%', // Ensure full width for alignment
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10, // Extra space to separate from name
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
    },
    ratingText: {
        fontSize: 18,
        color: '#FFD700',
        marginLeft: 6, // Add space between name and star
    },
    emailText: {
        fontSize: 16,
        color: '#666666',
        marginTop: 6, // Space between name and email
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
    buttonContainer: {
        marginVertical: 10,
    },
    section: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        width: '90%',
    },
    sectionText: {
        fontSize: 18,
        color: '#333333',
    },
});

export default ProfilePage;


