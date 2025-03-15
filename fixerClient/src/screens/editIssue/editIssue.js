import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { IPAddress } from '../../../ipAddress';

/**
 * @module fixerClient
 */

export default function EditIssue({ route, navigation }) {
    const { jobId } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [other, setOther] = useState(false);

    /**
     * Fetches the details of a job from the server and updates the state with the retrieved data.
     * 
     * @async
     * @function fetchJobDetails
     * @returns {Promise<void>}
     * @throws Will alert the user if there is an invalid session, job ID, or if an error occurs during the fetch.
     * 
     * @description
     * This function retrieves the job details using the provided job ID and token stored in AsyncStorage.
     * If the token or job ID is invalid, it alerts the user and navigates back.
     * On successful fetch, it updates the state with the job details including title, description, professional needed, and image.
     * It also sets a flag if the description is not in the predefined list of common issues.
     * If the fetch fails, it alerts the user about the failure.
     */
    const fetchJobDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token || !jobId) {
                Alert.alert('Invalid session or job ID');
                navigation.goBack();
                return;
            }

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/issue/${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200) {
                const { title, description, professionalNeeded, image } = response.data;
                setTitle(title);
                setDescription(description);
                setProfessionalNeeded(professionalNeeded);
                setImage(image);
                setOther(!["Dripping Faucets", "Clogged Drains", "Leaky Pipes", "Flickering Lights", "Dead Outlets", "Faulty Switch"].includes(description));
            } else {
                Alert.alert('Failed to load job details');
            }
        } catch (error) {
            Alert.alert('An error occurred while loading job details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobDetails();
    }, []);

    /**
     * Asynchronously picks an image from the device's media library.
     * Requests permission to access the media library if not already granted.
     * If permission is granted, opens the image picker allowing the user to select an image.
     * If an image is selected and not canceled, sets the image URI.
     *
     * @async
     * @function pickImage
     * @returns {Promise<void>} A promise that resolves when the image picking process is complete.
     */
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission to access images is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    /**
     * Updates the job with the provided details.
     * 
     * This function performs the following steps:
     * 1. Validates that all required fields (title, professionalNeeded, description) are filled.
     * 2. Retrieves the authentication token from AsyncStorage.
     * 3. Constructs a FormData object with the job details and optional image.
     * 4. Sends a PUT request to update the job on the server.
     * 5. Handles the server response and displays appropriate alerts based on the outcome.
     * 6. Manages loading state during the update process.
     * 
     * @async
     * @function updateJob
     * @returns {Promise<void>} - A promise that resolves when the job update process is complete.
     * @throws Will display an alert if any error occurs during the update process.
     */
    const updateJob = async () => {
        if (!title || !professionalNeeded || !description) {
            Alert.alert("Please complete all fields for the professional to provide an accurate quote.");
            return;
        }

        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('You are not logged in');
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('professionalNeeded', professionalNeeded);
            formData.append('status', "Open");

            if (image) {
                formData.append('image', {
                    uri: image,
                    type: 'image/jpeg',
                    name: 'issue_image.jpg',
                });
            }

            const response = await axios.put(`https://fixercapstone-production.up.railway.app/issue/${jobId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Response from server:', response.data); // Debugging line

            if (response.status === 200) {
                Alert.alert('Job updated successfully');
                navigation.goBack();
            } else {
                Alert.alert('Failed to update job');
            }
        } catch (error) {
            if (error.response) {
                console.error('Server responded with an error:', error.response.data);
                Alert.alert(`Error: ${error.response.data.message || 'Failed to update job'}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                Alert.alert('No response from server. Please try again later.');
            } else {
                console.error('Error updating job:', error.message);
                Alert.alert('An error occurred while updating the job');
            }
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Edit Job</Text>
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />

            {/* Professional selection options */}
            <View style={styles.workBlocksContainer}>
                <Text style={styles.sectionTitle}>Professional Needed</Text>
                <View style={styles.workBlocks}>
                    <TouchableOpacity style={styles.workBlock} onPress={() => setProfessionalNeeded('plumber')}>
                        <Text style={styles.workText}>Plumber</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.workBlock} onPress={() => setProfessionalNeeded('electrician')}>
                        <Text style={styles.workText}>Electrician</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Issue Description</Text>
                {professionalNeeded === 'plumber' && (
                    <View style={styles.workBlocks}>
                        <TouchableOpacity style={styles.workBlock} onPress={() => { setDescription('Dripping Faucets'); setOther(false); }}>
                            <Text style={styles.workText}>Dripping Faucets</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={() => { setDescription('Clogged Drains'); setOther(false); }}>
                            <Text style={styles.workText}>Clogged Drains</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={() => { setDescription('Leaky Pipes'); setOther(false); }}>
                            <Text style={styles.workText}>Leaky Pipes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={() => setOther(true)}>
                            <Text style={styles.workText}>Other</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {professionalNeeded === 'electrician' && (
                    <View style={styles.workBlocks}>
                        <TouchableOpacity style={styles.workBlock} onPress={() => { setDescription('Flickering Lights'); setOther(false); }}>
                            <Text style={styles.workText}>Flickering Lights</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={() => { setDescription('Dead Outlets'); setOther(false); }}>
                            <Text style={styles.workText}>Dead Outlets</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={() => { setDescription('Faulty Switch'); setOther(false); }}>
                            <Text style={styles.workText}>Faulty Switch</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={() => setOther(true)}>
                            <Text style={styles.workText}>Other</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {other && (
                <TextInput
                    placeholder="Describe the issue..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    style={{ borderBottomWidth: 1, height: 100, textAlignVertical: 'top', marginBottom: 10 }}
                />
            )}

            {/* Image upload */}
            <TouchableOpacity onPress={pickImage} style={{ marginBottom: 15 }}>
                <View style={{ backgroundColor: '#eee', padding: 10, alignItems: 'center', borderRadius: 5 }}>
                    <Text>Upload Image</Text>
                </View>
            </TouchableOpacity>

            {image && (
                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                    <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
                </View>
            )}

            <Button title="Save Changes" onPress={updateJob} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    workBlocksContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    workBlocks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    workBlock: {
        backgroundColor: '#f0f0f0',
        width: '48%',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
    },
    workText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
