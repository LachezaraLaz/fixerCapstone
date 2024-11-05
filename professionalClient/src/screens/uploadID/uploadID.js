import React, { useEffect, useState } from 'react';
import { View, Button, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPAddress } from '../../../ipAddress';

const UploadID = () => {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const navigation = useNavigation();

    // Request camera permission
    useEffect(() => {
        const requestCameraPermission = async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            console.log('Camera permission status:', status);  // Log the permission status
            setHasCameraPermission(status === 'granted');

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera access is required to take a picture.');
            }
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

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const localUri = result.assets[0].uri;
            const filename = localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            const formData = new FormData();
            formData.append('idImage', {
                uri: localUri,
                type: type,
                name: filename,
            });

            console.log("FormData:", formData);
            console.log("Image URI:", localUri);

            try {
                // Fetch the JWT token from AsyncStorage
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.error("Error: Token is missing from AsyncStorage");
                    Alert.alert('Error', 'Authentication token is missing. Please sign in again.');
                    return;
                }

                console.log("JWT Token:", token);

                // Send the image and token to the backend
                const response = await axios.post(`http://${IPAddress}:3000/professional/uploadID`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,  // Fixed string interpolation
                    },
                });

                if (response.status === 200) {
                    console.log('ID image uploaded successfully');
                    navigation.navigate('ThankYouPage');
                } else {
                    console.error('Unexpected response status:', response.status);
                    Alert.alert('Error', 'Failed to upload the ID.');
                }
            } catch (error) {
                if (error.response) {
                    console.error('Server responded with an error:', error.response.data);
                    Alert.alert('Upload Failed', 'The server responded with an error.');
                } else if (error.request) {
                    console.error('No response received:', error.request);
                    Alert.alert('Network Error', 'No response received from the server. Please check your network and try again.');
                } else {
                    console.error('Error setting up request:', error.message);
                    Alert.alert('Request Error', 'There was an error setting up the request.');
                }
            }
        } else {
            console.log("No image selected or operation canceled");
        }
    };

    return (
        <View>
            <Button title="Take a Picture of Your ID" onPress={handleImagePick} />
        </View>
    );
};

export default UploadID;
