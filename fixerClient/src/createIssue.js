import * as React from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('professionalNeeded', professionalNeeded);

        console.log("hh");

        if (image) {
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'issue_image.jpg',
            });
        }

        console.log("ll");

        // // Assuming you have stored the user's email in AsyncStorage or have access to it in some way
        // const email = await AsyncStorage.getItem('userEmail');
        // if (email) {
        //     console.log(email);
        //     formData.append('email', email);  // Append email
        // }

        console.log("kk");

        try {
            const response = await axios.post('http://192.168.2.22:3000/issue/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
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
        // if (image == null) {
        //     console.log("User is trying to submit job without an image.");
        //     Alert.alert(
        //         "No Image",
        //         "Are you sure you want to submit without an image?",
        //         [
        //             {
        //                 text: "No",
        //                 onPress: () => console.log("User answered 'No' and wants to add an image."),
        //                 style: "cancel"
        //             },
        //             {
        //                 text: "Yes",

        //                 onPress: () => {
        //                     console.log("Form submitted without an image.");
        //                     // Add your logic here for submitting without an image
        //                 }

        //             }
        //         ],
        //         { cancelable: false }
        //     );
        // }

        // console.log("Issue Posted:", { title, description, professionalNeeded, image });
        // alert("Issue posted successfully!");
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
