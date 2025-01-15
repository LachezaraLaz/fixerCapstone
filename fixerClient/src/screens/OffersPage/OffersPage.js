import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function OffersPage({ route, navigation }) {
    const { jobId } = route.params;

    // Hardcoded offers data
    const [offers, setOffers] = useState([
        { id: 1, professional: 'John Doe', amount: 150, status: 'pending' },
        { id: 2, professional: 'Jane Smith', amount: 200, status: 'pending' },
    ]);

    const handleAcceptOffer = (offerId) => {
        Alert.alert('Offer Accepted', `You have accepted the offer ${offerId}`);
        // Update offer status in the database (mocked here)
        setOffers(offers.map(o => o.id === offerId ? { ...o, status: 'accepted' } : o));
    };

    const handleRejectOffer = (offerId) => {
        Alert.alert('Offer Rejected', `You have rejected the offer ${offerId}`);
        // Update offer status in the database (mocked here)
        setOffers(offers.map(o => o.id === offerId ? { ...o, status: 'rejected' } : o));
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Offers for Job {jobId}</Text>
            <ScrollView>
                {offers.map((offer) => (
                    <View
                        key={offer.id}
                        style={{
                            borderWidth: 1,
                            borderRadius: 5,
                            marginVertical: 5,
                            padding: 10,
                            borderColor: offer.status === 'accepted' ? 'green' : offer.status === 'rejected' ? 'red' : 'gray',
                        }}
                    >
                        <Text style={{ fontWeight: 'bold' }}>{offer.professional}</Text>
                        <Text>Amount: ${offer.amount}</Text>
                        <Text>Status: {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}</Text>
                        {offer.status === 'pending' && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => handleAcceptOffer(offer.id)}
                                    style={{ backgroundColor: 'green', borderRadius: 5, padding: 5 }}
                                >
                                    <Text style={{ color: 'white' }}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleRejectOffer(offer.id)}
                                    style={{ backgroundColor: 'red', borderRadius: 5, padding: 5 }}
                                >
                                    <Text style={{ color: 'white' }}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
