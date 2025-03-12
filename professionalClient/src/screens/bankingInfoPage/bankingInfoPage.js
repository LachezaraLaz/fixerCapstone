import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const BankingInfoPage = () => {
    const [accountNumber, setAccountNumber] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleSubmit = async () => {
        if (!accountNumber || !routingNumber) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);

        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');

            // Send banking information to the backend
            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/professional/add-banking-info`,
                { userId, accountNumber, routingNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Alert.alert('Success', 'Banking information added successfully.');
                navigation.goBack(); // Go back to the previous screen
            } else {
                Alert.alert('Error', response.data.message || 'Failed to add banking information.');
            }
        } catch (error) {
            console.error('Error adding banking information:', error);
            Alert.alert('Error', 'An error occurred while adding banking information.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Banking Information</Text>
            <Text style={styles.subtitle}>
                Please enter your bank account details to receive payments.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Account Number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Routing Number"
                value={routingNumber}
                onChangeText={setRoutingNumber}
                keyboardType="numeric"
            />

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
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
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