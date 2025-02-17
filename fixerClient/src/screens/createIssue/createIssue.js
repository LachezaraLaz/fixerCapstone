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
import {jwtDecode} from 'jwt-decode';
import { Picker } from '@react-native-picker/picker';
import { CommonActions } from '@react-navigation/native';

import { IPAddress } from '../../../ipAddress';

export default function CreateIssue({ navigation }) {
    // List of fields in the page
    const [title, setTitle] = useState('');
    const [selectedService, setSelectedService] = useState('Plumbing');
    const [selectedImage, setSelectedImage] = useState(null);


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

    // posting the issue by the user
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

            const response = await axios.post(`https://fixercapstone-production.up.railway.app/issue/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 201) {
                // Reset all fields to default values
                setTitle('');
                setDescription('');
                setProfessionalNeeded('');
                setImage(null);
                setOther(false);

                navigation.goBack();
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

    const countWords = (text) => {
        return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    };
    //frontend
    return (
        //possibility to dismiss the keyboard just by touching the screen
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={{ flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5'}}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Job Description</Text>

                {/* title field */}
                <TextInput
                    placeholder= "Describe your service"
                    value={title}
                    onChangeText={setTitle}
                    style={{
                        borderWidth: 1,
                        background:'#EFF1F999',
                        borderColor: '#ddd',
                        borderRadius: 8,
                        padding: 10,
                        marginVertical: 8,
                        height: 120,
                        textAlignVertical: 'top', // Ensures text starts from the top
                    }} multiline/>

                {/* Word & Character Counter - Positioned Below the Input */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 }}>
                    <Text style={{ fontSize: 12, color: '#555', marginRight: 10 }}>
                        {title.length} chars
                    </Text>
                    <Text style={{ fontSize: 10, color: '#555' }}>
                        {countWords(title)} words
                    </Text>
                </View>
                <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedService}
                    onValueChange={(itemValue) => setSelectedService(itemValue)}
                    style={styles.picker}
                    itemStyle={{ fontSize: 12, fontWeight: 'bold', color: 'blue' }} // iOS only
                >
                    <Picker.Item label="Select Service" value="" />
                    <Picker.Item label="Plumbing" value="plumbing" />
                    <Picker.Item label="Electrical" value="electrical" />
                </Picker>
                </View>

            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    pickerContainer: {
        backgroundColor: '#E7E7E7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginTop: 25,
        overflow: 'hidden',
    },
    picker: {
        height: 52,
        color: 'black', // Affects text color inside the picker
    },
    pickerItem: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'blue', // Works on iOS, ignored on Android
    },
    imagePicker: { alignItems: 'center', justifyContent: 'center', height: 100, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginVertical: 8 },
    imagePreview: { width: 100, height: 100, borderRadius: 8 },
    map: { height: 150, marginVertical: 8 },
    button: { backgroundColor: 'orange', padding: 12, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

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
        backgroundColor: '#1A8DEC', // Highlight color for selected button
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
