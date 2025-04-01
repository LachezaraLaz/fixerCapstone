import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../style/homeScreenStyle';
import NotificationButton from '../../../components/notificationButton';

export default function OfferDetails({ route, navigation }) {
    const { offerId } = route.params;
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchQuoteDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const profile = await axios.get(`http://192.168.0.19:3000/client/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const clientEmail = profile.data.email;

            const response = await axios.get(`http://192.168.0.19:3000/quotes/client/${clientEmail}`, {
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

    if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" />;
    if (!quote) return <Text style={styles.emptyText}>No offer found.</Text>;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Top Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: '#fff'
            }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        backgroundColor: '#f2f2f2',
                        padding: 10,
                        borderRadius: 100,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                >
                    <Ionicons name="arrow-back" size={20} color="black" />
                </TouchableOpacity>

                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Quote</Text>

                <NotificationButton onPress={() => navigation.navigate('NotificationPage')} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <Section label="Description" value={quote.jobDescription} />
                <Section label="Tools – Materials" value={quote.toolsMaterials} />
                <Section label="Price" value={`$${quote.price}`} highlight />
                <Section label="Terms and Conditions" value={quote.termsConditions} />

                {quote.status === 'pending' && (
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 30
                    }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                marginRight: 10,
                                borderColor: '#F28C28',
                                borderWidth: 2,
                                borderRadius: 12,
                                paddingVertical: 14,
                                alignItems: 'center',
                                backgroundColor: '#fff'
                            }}
                            onPress={() => updateOfferStatus('rejected')}
                        >
                            <Text style={{ color: '#F28C28', fontSize: 16, fontWeight: '600' }}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                marginLeft: 10,
                                backgroundColor: '#F28C28',
                                borderRadius: 12,
                                paddingVertical: 14,
                                alignItems: 'center'
                            }}
                            onPress={() => updateOfferStatus('accepted')}
                        >
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Accept</Text>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{label}</Text>
                <Text style={{
                    fontSize: 16,
                    color: '#F28C28',
                    fontWeight: 'bold'
                }}>
                    {value}
                </Text>
            </View>
        );
    }

    return (
        <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>{label}</Text>
            <Text style={{
                fontSize: 15,
                color: highlight ? '#F28C28' : '#444',
                fontWeight: highlight ? 'bold' : 'normal'
            }}>
                {value}
            </Text>
        </View>
    );
};
