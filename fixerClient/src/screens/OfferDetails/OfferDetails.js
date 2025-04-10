import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, SafeAreaView, StyleSheet
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import NotificationButton from '../../../components/notificationButton';
import styles from '../../../style/offerDetailsStyles'

export default function OfferDetails({ route, navigation }) {
    const { offerId } = route.params;
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchQuoteDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const profile = await axios.get(`https://fixercapstone-production.up.railway.app/client/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const clientEmail = profile.data.email;

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/quotes/client/${clientEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const foundQuote = response.data.find(q => q._id === offerId);
            if (foundQuote) setQuote(foundQuote);
            else Alert.alert('Error', 'Offer not found.');
        } catch (error) {
            console.error("Error fetching quote details:", error);
            Alert.alert('Error', 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuoteDetails();
    }, []);

    const updateOfferStatus = async (status) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(
                `https://fixercapstone-production.up.railway.app/quotes/${offerId}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                Alert.alert('Success', `Offer ${status}`);
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to update offer.');
            }
        } catch (error) {
            console.error('Error updating offer:', error);
            Alert.alert('Error', 'An error occurred.');
        }
    };

    if (loading) return <ActivityIndicator testID="ActivityIndicator" style={styles.loader} size="large" />;
    if (!quote) return <Text style={styles.emptyText}>No offer found.</Text>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Quote</Text>
                <NotificationButton onPress={() => navigation.navigate('NotificationPage')} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Section label="Description" value={quote.jobDescription} />
                <Section label="Tools – Materials" value={quote.toolsMaterials} />
                <Section label="Price" value={`$${quote.price}`} highlight />
                <Section label="Terms and Conditions" value={quote.termsConditions} />

                {quote.status === 'pending' && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.rejectButton} onPress={() => updateOfferStatus('rejected')}>
                            <Text style={styles.rejectText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptButton} onPress={() => updateOfferStatus('accepted')}>
                            <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const Section = ({ label, value, highlight = false }) => {
    if (label === 'Price') {
        return (
            <View style={styles.priceRow}>
                <Text style={styles.sectionLabel}>{label}</Text>
                <Text style={styles.priceValue}>{value}</Text>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionLabel}>{label}</Text>
            <Text style={[styles.sectionValue, highlight && { color: '#F28C28', fontWeight: 'bold' }]}>
                {value}
            </Text>
        </View>
    );
};
