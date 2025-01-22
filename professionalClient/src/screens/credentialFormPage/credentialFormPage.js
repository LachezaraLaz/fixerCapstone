import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';  // To retrieve JWT
import { IPAddress } from '../../../ipAddress';

const CredentialFormPage = () => {
    const [tradeLicense, setTradeLicense] = useState(''); // State for the trade license input
    const navigation = useNavigation();

    const handleSubmit = async () => {
        try {
            // Get the JWT token from AsyncStorage
            const token = await AsyncStorage.getItem('token');

            if (token) {
                // Submit the trade license to the backend with the token
                await axios.post(`https://fixercapstone-production.up.railway.app/professional/verify`, {
                    tradeLicense,  // Send trade license in the request body
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`  // Pass the token in the Authorization header
                    }
                });

                navigation.navigate('UploadID'); // Navigate to photo upload
            } else {
                console.error('No token found');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Enter your Trade License:</Text>
            <TextInput
                placeholder="Trade License Number"
                value={tradeLicense}
                onChangeText={setTradeLicense}
                style={styles.input}
            />
            <Button title="Submit" onPress={handleSubmit} />
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

export default CredentialFormPage;
