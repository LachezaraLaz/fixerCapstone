import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ProfilePage = () => {
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bankingInfoAdded, setBankingInfoAdded] = useState(false); // New state for banking info status
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

    const fetchBankingInfoStatus = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token'); // Get the JWT token

            console.log("Fetched userId:", userId);
            console.log("Fetched token:", token);

            if (!userId || !token) {
                console.error("No userId or token found in AsyncStorage");
                return;
            }

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/banking-info-status`, {
                params: { userId },
                headers: { Authorization: `Bearer ${token}` },
            });

            setBankingInfoAdded(response.data.bankingInfoAdded);
        } catch (error) {
            console.error('Error fetching banking info status:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchBankingInfoStatus();
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;
    }

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

    const handleViewReviews = () => {
        navigation.navigate('ReviewsPage', { professionalEmail: professional.email });
    };

    const handleVerifyCredentials = () => {
        navigation.navigate('CredentialFormPage');
    };

    return (
        <View style={styles.container}>
            <View style={styles.customHeader}>
                <Text style={styles.headerLogo}>Fixr</Text>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SettingsPage')}
                    style={styles.settingsButton}
                >
                    <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Notice for banking information */}
            {!bankingInfoAdded && (
                <View style={styles.noticeContainer}>
                    <Text style={styles.noticeText}>
                        Please add your banking information to start submitting quotes.
                    </Text>
                </View>
            )}

            {!bankingInfoAdded && (
                <TouchableOpacity
                    style={styles.addBankingButton}
                    onPress={() => navigation.navigate('BankingInfoPage')}
                >
                    <Text style={styles.addBankingButtonText}>Add Banking Information</Text>
                </TouchableOpacity>
            )}

            <View style={styles.profileContainer}>
                <View style={styles.imageWrapper}>
                    <Image source={require('../../../assets/profile.jpg')} style={styles.profileImage} />
                    <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
                        <MaterialIcons name="edit" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.nameText}>{professional.firstName} {professional.lastName}</Text>
                <Text style={styles.ratingText}>⭐ {professional.totalRating || 0} ({professional.reviewCount} reviews)</Text>
                <Text style={styles.emailText}>{professional.email}</Text>
            </View>

            {!professional.formComplete ? (
                <View style={styles.buttonContainer}>
                    <Button title="Verify Credentials" onPress={handleVerifyCredentials} />
                </View>
            ) : professional.approved ? (
                <Text style={styles.verifiedText}>Credentials Verified!</Text>
            ) : (
                <Text style={styles.waitingText}>Credential Verification Status: Waiting...</Text>
            )}

            <View style={styles.buttonContainer}>
                <Button title="View Reviews" onPress={handleViewReviews} />
            </View>

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
        alignItems: 'center',
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
    imageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'grey',
        borderRadius: 12,
        padding: 6,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 10,
    },
    ratingText: {
        fontSize: 18,
        color: '#FFD700',
        marginTop: 6,
    },
    emailText: {
        fontSize: 16,
        color: '#666666',
        marginTop: 6,
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
    noticeContainer: {
        backgroundColor: '#fff3cd', // Light yellow background
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffeeba', // Yellow border
        marginBottom: 16,
        marginHorizontal: 16, // Add horizontal margin for better spacing
        width: '90%', // Match the width of other sections
    },
    noticeText: {
        color: '#856404', // Dark yellow text
        fontSize: 16,
        textAlign: 'center', // Center the text
    },
});

export default ProfilePage;