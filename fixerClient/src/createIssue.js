import * as React from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';  // Import a JWT decode library


export default function CreateIssue() {
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
            alert('Permission to access images is required!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.uri);
        }
    };

    const postIssue = async () => {
        if (!title || !professionalNeeded || !description) {
            console.log("User is trying to submit without completing the title, description or professional needed field.");
            alert("Some fields are empty. Please complete everything for the professional to give you the most informed quote!");
            return;
        }

        if (image) {
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'issue_image.jpg',
            });
        }

        // Get the token from AsyncStorage
        const token = await AsyncStorage.getItem('token');

        // Decode the token to extract the user's email
        const decodedToken = jwtDecode(token);
        const userEmail = decodedToken.email; // Assuming the token contains the user's email

        console.log("User's email from token:", userEmail);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('professionalNeeded', professionalNeeded);
        formData.append('email', userEmail);

        try {
            const response = await axios.post('http://192.168.2.22:3000/issue/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`, // Send the token in the headers for verification (if needed)
                },
            });

            if (response.status === 201) {
                alert('Issue posted successfully');
            } else {
                alert('Failed to post the issue');
            }
        } catch (error) {
            if (error.response) {
                console.error("Response error:", error.response.data);
            } else if (error.request) {
                console.error("Request error:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
            alert('An error occurred. Please try again.');
        }

        };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Create New Issue</Text>

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

            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginBottom: 15 }} />}

            <Button title="Post Issue" onPress={postIssue} />
        </View>
    );
}
