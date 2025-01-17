import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPAddress } from '../../../ipAddress';

export default function OffersPage({ route }) {
    const { jobId } = route.params; // Extract jobId from route.params

    // State for storing offers and loading state
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to fetch offers from the database
    const fetchOffers = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token'); // Ensure token retrieval works
            if (!token) {
                Alert.alert('You are not logged in');
                setLoading(false);
                return;
            }
            const response = await axios.get(`http://${IPAddress}:3000/quotes/job/${jobId}`, { // Use dynamic jobId
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
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

    const handleAcceptOffer = async (offerId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(
                `http://${IPAddress}:3000/quotes/${offerId}`,
                { status: 'accepted' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                Alert.alert('Offer Accepted', 'You have accepted the offer.');
                fetchOffers();
            } else {
                Alert.alert('Failed to accept the offer.');
            }
        } catch (error) {
            console.error('Error accepting offer:', error);
            Alert.alert('An error occurred while accepting the offer.');
        }
    };

    const handleRejectOffer = async (offerId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(
                `http://${IPAddress}:3000/quotes/${offerId}`,
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
                <ActivityIndicator size="large" color="#0000ff" />
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
                                Professional: {offer.professionalEmail}
                            </Text>
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
