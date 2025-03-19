import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';

const BankingInfoPage = () => {
    const [loading, setLoading] = useState(false);
    const { createPaymentMethod } = useStripe();
    const navigation = useNavigation();
    const isUnmounted = React.useRef(false);

    useEffect(() => {
        return () => {
            isUnmounted.current = true;
        };
    }, []);

    const handleSubmit = async () => {
        setLoading(true);

        try {
            console.log("Before createPaymentMethod");
            const { paymentMethod, error } = await createPaymentMethod({
                paymentMethodType: 'Card',
            });

            console.log("After createPaymentMethod");
            if (error) {
                if (!isUnmounted.current) Alert.alert('Error', error.message);
                return;
            }

            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');

            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/professional/add-banking-info`,
                { professionalId: userId, paymentMethodId: paymentMethod.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Before success");
            if (response.data.status === 'success') {
                if (!isUnmounted.current) {
                    Alert.alert('Success', 'Credit card added successfully.', [
                        {
                            text: 'OK',
                            onPress: () => {
                                console.log("Success, but not navigating"); // Temporarily remove navigation
                            },
                        },
                    ]);
                    console.log("After success");
                }
            } else {
                if (!isUnmounted.current) Alert.alert('Error', response.data.data || 'Failed to add credit card.');
            }
        } catch (error) {
            console.error('Error adding credit card:', error);
            if (!isUnmounted.current) Alert.alert('Error', 'An error occurred while adding credit card.');
        } finally {
            console.log("Before unmounting");
            if (!isUnmounted.current) setLoading(false); // Prevent state updates after unmount
            console.log("After unmounting");
        }
    };

    const handleNavigation = () => {
        try {
            console.log("Before test navigation");
            // Navigate back to MainTabs
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                })
            );
            console.log("After test navigation");
        } catch (error) {
            console.error("Navigation error:", error);
            Alert.alert("Navigation Error", "Could not navigate to Home screen");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Credit Card</Text>
            <Text style={styles.subtitle}>
                Please enter your credit card details to enable payments.
            </Text>

            {/* Stripe CardField for collecting credit card details */}
            <CardField
                postalCodeEnabled={false}
                placeholder={{
                    number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                    backgroundColor: '#FFFFFF', // Ensure background color is valid
                    borderWidth: 1,
                    borderColor: '#000000', // Ensure border color is valid
                    borderRadius: 8,
                    textColor: '#000000', // Ensure text color is valid
                }}
                style={styles.cardFieldContainer}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleNavigation}
            >
                <Text style={styles.buttonText}>Test Navigation</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Submitting...' : 'Submit'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    cardField: {
        backgroundColor: '#ffffff',
        borderColor: '#ccc',
        borderRadius: 8,
        borderWidth: 1,
    },
    cardFieldContainer: {
        height: 50,
        marginBottom: 16,
    },
    button: {
        backgroundColor: 'orange',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default BankingInfoPage;