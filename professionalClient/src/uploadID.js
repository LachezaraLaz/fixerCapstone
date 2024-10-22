import React, { useEffect, useState } from 'react';
import { View, Button, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UploadID = () => {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const navigation = useNavigation();

    // Request camera permission
    useEffect(() => {
        const requestCameraPermission = async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            setHasCameraPermission(status === 'granted');
        };
        requestCameraPermission();
    }, []);

    const handleImagePick = async () => {
        if (hasCameraPermission === false) {
            Alert.alert('Permission Denied', 'Camera access is required to take a picture.');
            return;
        }

        // Launch camera for ID capture
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            // Upload image to backend
            const formData = new FormData();
            formData.append('idImage', {
                uri: result.uri,
                type: 'image/jpeg',
                name: 'id.jpg',
            });

            try {
                // Get the JWT token from AsyncStorage
                const token = await AsyncStorage.getItem('token');

                if (token) {
                    // Send request to the backend with the JWT token
                    await axios.post('http://<"add-ip">:3000/professional/uploadID', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    navigation.navigate('ThankYouPage');
                } else {
                    console.error('No token found');
                }
            } catch (error) {
                console.error('Error uploading ID:', error);
            }
        }
    };

    return (
        <View>
            <Button title="Take a Picture of Your ID" onPress={handleImagePick} />
        </View>
    );
};

export default UploadID;
