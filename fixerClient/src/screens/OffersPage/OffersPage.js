import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPAddress } from '../../../ipAddress';
import { useNavigation } from '@react-navigation/native';

/**
 * @module fixerClient
 */

export default function OffersPage({ route }) {
    const { jobId } = route.params; // Extract jobId from route.params

    // State for storing offers and loading state
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();   

    /**
     * Fetches offers for a specific job and updates the state with the retrieved offers.
     * 
     * This function performs the following steps:
     * 1. Sets the loading state to true.
     * 2. Retrieves the authentication token from AsyncStorage.
     * 3. If the token is not found, displays an alert and exits the function.
     * 4. Makes an API request to fetch offers for the specified job using the retrieved token.
     * 5. If the response is successful and contains offers, updates the state with the offers.
     * 6. If no offers are found, displays an alert.
     * 7. If an error occurs during the API request, logs the error and displays an alert.
     * 8. Finally, sets the loading state to false.
     * 
     * @async
     * @function fetchOffers
     * @returns {Promise<void>} A promise that resolves when the function completes.
     */
    const fetchOffers = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('You are not logged in');
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `https://fixercapstone-production.up.railway.app/quotes/job/${jobId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Check if response and required fields exist
            if (response?.status === 200 && Array.isArray(response.data?.offers)) {
                setOffers(response.data.offers);
            } else {
                Alert.alert('No offers found for this job');
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            Alert.alert('Failed to fetch offers. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch offers when the component loads
    useEffect(() => {
        fetchOffers();
    }, []);

    /**
     * Handles the acceptance of an offer.
     *
     * @param {string} offerId - The ID of the offer to accept.
     * @returns {Promise<void>} - A promise that resolves when the offer is accepted.
     * @throws {Error} - Throws an error if there is an issue accepting the offer.
     */
    const handleAcceptOffer = async (offerId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(
                `https://fixercapstone-production.up.railway.app/quotes/${offerId}`,
                { status: 'accepted' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                Alert.alert('Offer Accepted', 'You have accepted the offer.');
                navigation.navigate('ChatListPage');
            } else {
                Alert.alert('Failed to accept the offer.');
            }
        } catch (error) {
            console.error('Error accepting offer:', error);
            Alert.alert('An error occurred while accepting the offer.');
        }
    };

    /**
     * Handles the rejection of an offer.
     *
     * This function sends a PUT request to update the status of an offer to 'rejected'.
     * If the request is successful, it alerts the user and refreshes the offers.
     * If the request fails, it alerts the user of the failure.
     *
     * @param {string} offerId - The ID of the offer to be rejected.
     * @returns {Promise<void>} - A promise that resolves when the offer rejection process is complete.
     */
    const handleRejectOffer = async (offerId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(
                `https://fixercapstone-production.up.railway.app/quotes/${offerId}`,
                { status: 'rejected' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                Alert.alert('Offer Rejected', 'You have rejected the offer.');
                fetchOffers(); // Refresh offers after the update
            } else {
                Alert.alert('Failed to reject the offer.');
            }
        } catch (error) {
            console.error('Error rejecting offer:', error);
            Alert.alert('An error occurred while rejecting the offer.');
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator testID="loading-indicator" size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                Offers for Job ID: {jobId}
            </Text>
            <ScrollView>
                {offers.length > 0 ? (
                    offers.map((offer) => (
                        <View
                            key={offer._id}
                            style={{
                                borderWidth: 1,
                                borderRadius: 8,
                                marginVertical: 8,
                                padding: 12,
                                borderColor:
                                    offer.status === 'accepted'
                                        ? 'green'
                                        : offer.status === 'rejected'
                                            ? 'red'
                                            : 'gray',
                            }}
                        >
                            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                                Professional:
                            </Text>
                            <Text >{offer.professionalFullName || offer.professionalEmail}</Text>
                            <Text >{offer.professionalEmail}</Text>
                            <Text ></Text>
                            <Text>Price: ${offer.price}</Text>
                            <Text>Status: {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}</Text>
                            {offer.status === 'pending' && (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginTop: 10,
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleAcceptOffer(offer._id)}
                                        style={{
                                            backgroundColor: 'green',
                                            borderRadius: 5,
                                            paddingVertical: 8,
                                            paddingHorizontal: 15,
                                        }}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleRejectOffer(offer._id)}
                                        style={{
                                            backgroundColor: 'red',
                                            borderRadius: 5,
                                            paddingVertical: 8,
                                            paddingHorizontal: 15,
                                        }}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <Text style={styles.date}>Quote made on: { new Date(offer.createdAt).toLocaleString() }</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>
                        No offers available for this job.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    date: { 
        fontSize: 12, 
        color: 'gray',
        paddingTop: 10
    },
});

