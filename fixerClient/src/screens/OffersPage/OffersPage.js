import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Image,
    SafeAreaView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NotificationButton from '../../../components/notificationButton';
import styles from '../../../style/homeScreenStyle';

export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientEmail, setClientEmail] = useState(null);
    const navigation = useNavigation();

    const fetchClientEmail = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'You are not logged in.');
                return;
            }

            const response = await axios.get(
                `https://fixercapstone-production.up.railway.app/client/profile`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200 && response.data?.email) {
                setClientEmail(response.data.email);
            } else {
                Alert.alert('Error', 'Failed to retrieve client email.');
            }
        } catch (error) {
            console.error('Error fetching client email:', error.response?.data || error.message);
            Alert.alert('Error fetching profile. Please try again later.');
        }
    };

    const fetchOffers = async (email) => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token || !email) {
                Alert.alert('Error', 'You are not logged in or no client email found.');
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `https://fixercapstone-production.up.railway.app/quotes/client/${email}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response?.status === 200 && Array.isArray(response.data)) {
                setOffers(response.data);
            } else {
                Alert.alert('No offers found for your jobs.');
            }
        } catch (error) {
            console.error('Error fetching offers:', error.response?.data || error.message);
            Alert.alert('Failed to fetch offers. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadClientData = async () => {
            await fetchClientEmail();
        };
        loadClientData();
    }, []);

    useEffect(() => {
        if (clientEmail) {
            fetchOffers(clientEmail);
        }
    }, [clientEmail]);

    const handleAcceptOffer = async (offerId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(
                `https://fixercapstone-production.up.railway.app/quotes/${offerId}`,
                { status: 'accepted' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                Alert.alert('Offer Accepted');
                fetchOffers(clientEmail);
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
                `https://fixercapstone-production.up.railway.app/quotes/${offerId}`,
                { status: 'rejected' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                Alert.alert('Offer Rejected');
                fetchOffers(clientEmail);
            }
        } catch (error) {
            console.error('Error rejecting offer:', error);
            Alert.alert('An error occurred while rejecting the offer.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: '#fff',
            }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 4,
                    }}
                >
                    <Ionicons name="arrow-back" size={20} color="black" />
                </TouchableOpacity>

                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Offers</Text>

                <NotificationButton onPress={() => navigation.navigate('NotificationPage')} />
            </View>

            <ScrollView style={styles.requestsContainer}>
                {offers.length > 0 ? (
                    offers.map((offer) => (
                        <TouchableOpacity
                            key={offer._id}
                            style={styles.requestCard}
                            onPress={() => navigation.navigate('OfferDetails', { offerId: offer._id })}
                        >
                            <Image
                                source={{ uri: 'https://via.placeholder.com/60' }}
                                style={styles.requestUserImage}
                            />
                            <View style={styles.requestContent}>
                                <View style={styles.requestTopRow}>
                                    <Text style={styles.requestUserName}>
                                        {(offer.professionalFirstName || offer.professionalLastName)
                                            ? `${offer.professionalFirstName} ${offer.professionalLastName}`
                                            : offer.professionalEmail}
                                    </Text>
                                    <View style={styles.requestRating}>
                                        <Ionicons name="star" size={16} color={(offer.professionalReviewCount ?? 0) > 0 ? "#FFA500" : "grey"} />
                                        <Text style={[styles.ratingText, { color: (offer.professionalReviewCount ?? 0) > 0 ? "#FFA500" : "grey" }]}>
                                            {(offer.professionalReviewCount ?? 0) > 0
                                                ? (offer.professionalTotalRating ?? 0).toFixed(1)
                                                : "0"}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.requestAddressRow}>
                                    <Ionicons name="cash-outline" size={16} color="#FFA500" style={{ marginRight: 4 }} />
                                    <Text style={styles.requestAddress}>Price: ${offer.price}</Text>
                                </View>
                                <View style={styles.dateRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#FFA500" style={{ marginRight: 4 }} />
                                    <Text style={styles.date}>
                                        {offer.createdAt && !isNaN(new Date(offer.createdAt))
                                            ? new Date(offer.createdAt).toLocaleDateString()
                                            : 'Invalid Date'}
                                    </Text>
                                </View>

                                <Text style={styles.requestJob}>
                                    Status: {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                                </Text>

                                {offer.status === 'pending' && (
                                    <View style={styles.requestButtonsRow}>
                                        <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectOffer(offer._id)}>
                                            <Text style={styles.rejectText}>Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptOffer(offer._id)}>
                                            <Text style={styles.acceptText}>Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No offers available for your jobs.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
