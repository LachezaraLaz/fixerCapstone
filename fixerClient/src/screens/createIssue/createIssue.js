//Import list
import * as React from 'react';
import {
    ScrollView,
    View,
    Text,
    TextInput,
    Button,
    Image,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    Alert,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { CommonActions } from '@react-navigation/native';

import { IPAddress } from '../../../ipAddress';

export default function CreateIssue({ navigation }) {
    // List of fields in the page
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [other, setOther] = useState(false);


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
            <ScrollView style={{ flexGrow: 1, padding: 20}}>
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

                {/* Work Blocks Section */}
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
                        <TouchableOpacity style={styles.workBlock} onPress={() => {
                            setDescription('Dripping Faucets'); setOther(false)
                        }}>
                            <Text style={styles.workText}>Dripping Faucets</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={() => {
                            setDescription('Clogged Drains'); setOther(false)
                        }}>
                            <Text style={styles.workText}>Clogged Drains</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={() => {
                            setDescription('Leaky Pipes'); setOther(false)
                        }}>
                            <Text style={styles.workText}>Leaky Pipes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.workBlock} onPress={
                            () => setOther(true)
                        }>
                            <Text style={styles.workText}>Other</Text>
                        </TouchableOpacity>
                    </View>
                    )}

                    {professionalNeeded === 'electrician' && (
                        <View style={styles.workBlocks}>
                            <TouchableOpacity style={styles.workBlock} onPress={() => {
                                setDescription('Flickering Lights'); setOther(false)
                            }}>
                                <Text style={styles.workText}>Flickering Lights</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.workBlock} onPress={() => {
                                setDescription('Dead Outlets'); setOther(false)
                            }}>
                                <Text style={styles.workText}>Dead Outlets</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.workBlock} onPress={() => {
                                setDescription('Faulty Switch'); setOther(false)
                            }}>
                                <Text style={styles.workText}>Faulty Switch</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.workBlock} onPress={
                                () => setOther(true)
                            }>
                                <Text style={styles.workText}>Other</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>

                {other === true && (
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
                )}

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

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Button testID={'post-job-button'} title="Post Job" onPress={postIssue} disabled={loading} />
                )}
                <View style={{ height: 30 }} />
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    workBlocksContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
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
    selectedButton: {
        backgroundColor: '#4CAF50', // Highlight color for selected button
    },
    workText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    helpSection: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    helpButton: {
        backgroundColor: '#e0e0e0',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    helpButtonText: {
        fontSize: 16,
        color: '#333',
    },
    logoutContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    logoutButton: {
        backgroundColor: '#ffdddd',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#d9534f',
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        marginTop: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#666',
    },
});
