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
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';

import { IPAddress } from '../../../ipAddress';

export default function CreateIssue({ navigation }) {
    // List of fields in the page
    const [title, setTitle] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [items, setItems] = useState([
        { label: 'Select Service', value: '' },
        { label: 'Plumbing', value: 'plumbing' },
        { label: 'Electrical', value: 'electrical' },
    ]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [open, setOpen] = useState(false);


    //Pick an image component
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission required", "Please allow access to your gallery.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
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

    const handleImageSelection = async (source) => {
        const permissionResult = source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permission required", `Please allow access to your ${source}.`);
            return;
        }

        const result = source === 'camera'
            ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 })
            : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const countWords = (text) => {
        return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    return (
        //possibility to dismiss the keyboard just by touching the screen
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={{ flexGrow: 1, padding: 20, backgroundColor: '#ffffff'}}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Job Description</Text>

                {/* title field */}
                <TextInput
                    placeholder= "Describe your service"
                    value={title}
                    onChangeText={setTitle}
                    style={{
                        borderWidth: 1,
                        background:'#EFF1F999',
                        backgroundColor:'#E7E7E7',
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
                </View>
                <View style={styles.pickerContainer}>
                    <DropDownPicker
                        style={{backgroundColor: '#E7E7E7',borderColor: '#ddd'}}
                        open={open}
                        value={selectedService}
                        items={items}
                        setOpen={setOpen}
                        setValue={setSelectedService}
                        setItems={setItems}
                        textStyle={{ fontSize: 13, fontWeight: 'bold' }}
                        dropDownContainerStyle={{ zIndex: 1000 }} // Ensures dropdown renders above other components
                        listMode="SCROLLVIEW" // Uses ScrollView instead of FlatList (fixes VirtualizedLists issue)
                        nestedScrollEnabled={true} // Enables smooth scrolling within ScrollView
                    />
                </View>
                <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                        {selectedImage ? (
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                                <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                                    <Text style={styles.removeText}>✖</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.placeholder}>
                                <Image source={require('../../../assets/folder-add.png')} style={styles.icon} />
                                <Text style={styles.text}>Take from your gallery</Text>
                                <Text style={styles.supportedFormats}>Supported formats: JPEG, PNG, MP4</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    imageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    removeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 45
    },
    uploadBox: {
        width: 300,
        height: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        marginBottom: 10,
        tintColor: '#667085',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F79009',
    },
    supportedFormats: {
        fontSize: 12,
        color: '#667085',
        marginTop: 5,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    pickerContainer: {
        borderRadius: 8,
        marginTop: 20
    },
    imagePicker: { alignItems: 'center', justifyContent: 'center', height: 100, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginVertical: 8 },
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
