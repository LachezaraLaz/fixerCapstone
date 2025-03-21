import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { InteractionManager } from 'react-native';

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
                console.log("Payment error:", error);
                if (!isUnmounted.current) Alert.alert('Error', error.message);
                return;
            }

            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');

            console.log("User ID:", userId);
            console.log("Token:", token);

            console.log("Navigation state BEFORE API call:", navigation.getState());

            // Set timeout to prevent unmounting too soon
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/professional/add-banking-info`,
                { professionalId: userId, paymentMethodId: paymentMethod.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Server response:", response.data);
            console.log("Navigation state AFTER API call:", navigation.getState());

            if (response.data.status === 'success') {
                console.log("Success response received");

                if (!isUnmounted.current) {
                    Alert.alert('Success', 'Credit card added successfully.', [
                        {
                            text: 'OK',
                            onPress: () => {
                                handleNavigation();
                            },
                        },
                    ]);
                }
            } else {
                console.log("Error response from backend:", response.data);
                if (!isUnmounted.current) Alert.alert('Error', response.data.data || 'Failed to add credit card.');
            }
        } catch (error) {
            console.error('Error adding credit card:', error);

            if (!isUnmounted.current) {
                if (axios.isCancel(error)) {
                    Alert.alert('Request Canceled', 'The request was canceled.');
                } else {
                    Alert.alert('Error', 'An error occurred while adding credit card.');
                }
            }
        } finally {
            console.log("Before unmounting");
            if (!isUnmounted.current) setLoading(false);
            console.log("After unmounting");
        }
    };

    const [showCardField, setShowCardField] = useState(true);

    const handleNavigation = () => {
        if (isUnmounted.current) {
            console.log("Component is unmounted, skipping navigation reset.");
            return;
        }

        try {
            console.log("Before test navigation");

            if (!navigation) {
                console.error("Navigation object is not available");
                Alert.alert("Navigation Error", "Navigation object is not available.");
                return;
            }

            console.log("Navigation state before reset:", navigation.getState());

            // Hide CardField before navigation reset
            setShowCardField(false);

            InteractionManager.runAfterInteractions(() => {
                setTimeout(() => {
                    if (isUnmounted.current) {
                        console.log("Component is unmounted after delay, skipping navigation reset.");
                        return;
                    }

                    try {
                        console.log("Navigation state just before reset:", navigation.getState());

                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTabs' }],
                        });

                        console.log("Navigation dispatched successfully");
                    } catch (navError) {
                        console.error("Navigation dispatch error:", navError);
                        Alert.alert("Navigation Error", `Error: ${navError.message}`);
                    }
                }, 2000);
            });

            console.log("After test navigation");
        } catch (error) {
            console.error("Navigation error:", error);
            Alert.alert("Navigation Error", `Unhandled Error: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Credit Card</Text>
            <Text style={styles.subtitle}>
                Please enter your credit card details to enable payments.
            </Text>

            {/* Stripe CardField for collecting credit card details */}
            {showCardField && (
                <CardField
                    postalCodeEnabled={false}
                    placeholder={{
                        number: '4242 4242 4242 4242',
                    }}
                    cardStyle={{
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#000000',
                        borderRadius: 8,
                        textColor: '#000000',
                    }}
                    style={styles.cardFieldContainer}
                />
            )}

            {/*<TouchableOpacity*/}
            {/*    style={styles.button}*/}
            {/*    onPress={handleNavigation}*/}
            {/*>*/}
            {/*    <Text style={styles.buttonText}>Test Navigation</Text>*/}
            {/*</TouchableOpacity>*/}

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