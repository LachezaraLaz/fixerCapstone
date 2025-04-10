import React, {useState, useEffect, useContext} from 'react';
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
//import styles from '../../../style/homeScreenStyle';

import styles from '../../../style/offerPageStyle';

import { LanguageContext } from "../../../context/LanguageContext";
import { I18n } from "i18n-js";
import { en, fr } from "../../../localization";

export default function OffersPage({navigation}) {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientEmail, setClientEmail] = useState(null);
    // const navigation = useNavigation();


    //For translation
    const { locale } = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    /**
     * Fetch client profile to get client email.
     * Uses the same approach as the ProfilePage.
     */
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
            Alert.alert(i18n.t('offer_profile_error'));
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
            Alert.alert(i18n.t('offer_fetch_error'));
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

                Alert.alert(i18n.t('offer_accepted_title'), i18n.t('offer_accepted_message'));
                fetchOffers(clientEmail);
            } else {
                Alert.alert('Failed to accept the offer.');
            }
        } catch (error) {
            console.error('Error accepting offer:', error);
            Alert.alert(i18n.t('offer_accepted_error'));
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

                Alert.alert(i18n.t('offer_rejected_title'), i18n.t('offer_rejected_message'));
                fetchOffers(clientEmail);
            } else {
                Alert.alert('Failed to reject the offer.');
            }
        } catch (error) {
            console.error('Error rejecting offer:', error);
            Alert.alert(i18n.t('offer_rejected_error'));
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator testID="ActivityIndicator" size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* header */}
            {/* <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{i18n.t('offer_page_title')}</Text>
                </View> */}
                {/* <NotificationButton onPress={() => navigation.navigate('NotificationPage')} /> */}
            {/* </View> */}

            <View style={styles.header}>
                <TouchableOpacity testID="back-button" onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>{i18n.t('offer_page_title')}</Text>
                </View>
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
                                    <Text style={styles.requestAddress}>{i18n.t('offer_price')}: ${offer.price}</Text>
                                </View>
                                <View style={styles.dateRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#FFA500" style={{ marginRight: 4 }} />
                                    <Text style={styles.date}>
                                        {offer.createdAt && !isNaN(new Date(offer.createdAt))
                                            ? new Date(offer.createdAt).toLocaleDateString()
                                            : i18n.t('offer_date_invalid')}
                                    </Text>
                                </View>

                                <Text style={styles.requestJob}>
                                    {i18n.t('status')}:  {
                                    {
                                        accepted: i18n.t('accepted'),
                                        rejected: i18n.t('rejected'),
                                        pending: i18n.t('status_client.pending'),
                                        done: i18n.t('status_client.completed')
                                    }[offer.status] || offer.status
                                }
                                </Text>

                                {offer.status === 'pending' && (
                                    <View style={styles.requestButtonsRow}>
                                        <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectOffer(offer._id)}>
                                            <Text style={styles.rejectText}>{i18n.t('reject')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptOffer(offer._id)}>
                                            <Text style={styles.acceptText}>{i18n.t('accept')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text>{i18n.t('no_offers_message')}</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
