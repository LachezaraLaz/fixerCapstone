//Import list
import * as React from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode'; 

import { IPAddress } from '../../../ipAddress';

export default function CreateIssue({ navigation }) {
    // List of fields in the page
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [image, setImage] = useState(null);

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

    //backend to be post the job issue
    const postIssue = async () => {

        //checking if all the mandatory fields are entered
        if (!title || !professionalNeeded || !description) {
            console.log("User is trying to submit without completing the title, description or professional needed field.");
            Alert.alert("Some fields are empty. Please complete everything for the professional to give you the most informed quote!");
            return;
        }

        // Get the token (users info) from AsyncStorage
        const token = await AsyncStorage.getItem('token');

        // Decode the token to extract the user's email
        const decodedToken = jwtDecode(token);
        const userEmail = decodedToken.email;
        const userStreet = decodedToken.street;

        console.log("User's email from token:", userEmail);

        //tests if token carries the street information now 
        //THIS DOES NOT WORK YET
        console.log("User's street from token:", userStreet);
        // If you want to print all other variables, you can loop through the object (if necessary)
        Object.keys(decodedToken).forEach((key) => {
            console.log(`${key}: ${decodedToken[key]}`);
        });

        //adding all the necessary data to formData to then add to the job entry in the database
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

        //adding the entry in the job collection with error handling
        try {
            const response = await axios.post(`http://${IPAddress}:3000/issue/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 201) {
                Alert.alert('Job posted successfully');
                console.log("Job has been posted successfully");
                navigation.navigate('HomeScreen');
            } else {
                Alert.alert('Failed to post the job');
                console.log("Job posting failed");
            }
        } catch (error) {
            if (error.response) {
                console.error("Response error:", error.response.data);
            } else if (error.request) {
                console.error("Request error:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
            Alert.alert('An error occurred. Please try again.');
        }

        };
    //frontend
    return (
        //possibility to dismiss the keyboard just by touching the screen
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Create New Issue</Text>

                {/* title field */}
                <TextInput
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    style={{
                        borderWidth: 1, 
                        borderColor: '#ccc',
                        padding: 10,
                        borderRadius: 5,
                        marginBottom: 15
                    }}
                />

                {/* professional needed field */}
                <TextInput
                    placeholder="Professional Needed"
                    value={professionalNeeded}
                    onChangeText={setProfessionalNeeded}
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 10,
                        borderRadius: 5,
                        marginBottom: 15
                    }}
                />

                {/* description field */}
                <TextInput
                    placeholder="Describe the issue..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 10,
                        height: 100,
                        textAlignVertical: 'top',
                        borderRadius: 5,
                        marginBottom: 15
                    }}
                />

                {/* uploading of image button */}
                <TouchableOpacity onPress={pickImage} style={{ marginBottom: 15 }}>
                    <View
                        style={{
                            backgroundColor: '#eee',
                            padding: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                        }}
                    >
                        <Text>Upload Image</Text>
                    </View>
                </TouchableOpacity>

                {image && (
                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
                    </View>
                )}

                {/* posting job field */}
                <Button testID={'post-job-button'} title="Post Job" onPress={postIssue} />
            </View>
        </TouchableWithoutFeedback>
    );
}
