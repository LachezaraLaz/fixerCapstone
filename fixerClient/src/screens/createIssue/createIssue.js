//Import list
import * as React from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Alert, ActivityIndicator  } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode'; 

import { IPAddress } from '../../../ipAddress';
import styles from '../../../designSystems/components.js';


export default function CreateIssue({ navigation }) {
    // List of fields in the page
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    //backend 
    //backend to be able to pick an image 
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission to access images is required!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const postIssue = async () => {
        if (!title || !professionalNeeded || !description) {
            Alert.alert("Some fields are empty. Please complete everything for the professional to give you the most informed quote!");
            return;
        }

        setLoading(true); // Start loading

        try {
            const token = await AsyncStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email;

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('professionalNeeded', professionalNeeded);
            formData.append('email', userEmail);
            formData.append('status', "Open");

            if (image) {
                formData.append('image', {
                    uri: image,
                    type: 'image/jpeg',
                    name: 'issue_image.jpg',
                });
            }

            const response = await axios.post(`http://${IPAddress}:3000/issue/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 201) {
                navigation.navigate('HomeScreen');
                Alert.alert('Job posted successfully');
            } else {
                Alert.alert('Failed to post the job');
            }
        } catch (error) {
            Alert.alert('An error occurred. Please try again.');
        } finally {
            setLoading(false); // Stop loading after completion
        }
    };

    //frontend
    return (
        //possibility to dismiss the keyboard just by touching the screen
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.header}>Create New Issue</Text>

                {/* title field */}
                <TextInput
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                />

                {/* professional needed field */}
                <TextInput
                    placeholder="Professional Needed"
                    value={professionalNeeded}
                    onChangeText={setProfessionalNeeded}
                    style={styles.input}
                />

                {/* description field */}
                <TextInput
                    placeholder="Describe the issue..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    style={styles.textArea}
                />

                {/* uploading of image button */}
                <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
                        <Text>Upload Image</Text>
                </TouchableOpacity>

                {image && (
                    <View style={styles.imagePreview}>
                        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Button testID={'post-job-button'} title="Post Job" onPress={postIssue} disabled={loading} />
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}
