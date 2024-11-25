import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';  // To retrieve JWT
import { IPAddress } from '../../../ipAddress';

const contractOffer = ( issue ) => {
    // const [contract, setContract] = useState('');
    const [fee, setFee] = useState('');
    const navigation = useNavigation();

    const handleSubmit = async () => {
        try {
            // Get the JWT token from AsyncStorage
            const token = await AsyncStorage.getItem('token');

            if (token) {
                await axios.post(`http://${IPAddress}:3000/professional/contractOffer`, {
                    // contract,
                    fee
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`  // Pass the token in the Authorization header
                    }
                });
                navigation.navigate('homeScreen');
            } else {
                console.error('No token found');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Issue Details</Text>
            <Text>{issue.title}</Text>
            <Text>{issue.description}</Text>
            <Text>{issue.address}</Text>

            <TextInput
                placeholder="Fee"
                value={fee}
                onChangeText={setFee}
                style={styles.input}
            />
            <Text>Other conditions will be determined for the contract creation</Text>
            <Button title="Make Offer" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
});

export default contractOffer;
