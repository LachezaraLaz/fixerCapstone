//Import list
import * as React from 'react';
import styles from '../../../style/createIssueStyle'
import 'react-native-get-random-values';
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
import OrangeButton from "../../../components/orangeButton";
import MapView, {Marker} from "react-native-maps";

/**
 * @module fixerClient
 */

export default function CreateIssue({ navigation }) {
    // List of fields in the page
    const [description, setDescription] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [items, setItems] = useState([
        { label: 'Select Service', value: '' },
        { label: 'Plumbing', value: 'plumbing' },
        { label: 'Electrical', value: 'electrical' },
    ]);
    const [selectedImage, setSelectedImage] = useState(null);
    {/*TimeLine Dropdown*/}
    const [open, setOpen] = useState(false);
    const [selectedTimeLine, setSelectedTimeLine] = useState(null);
    const [itemsTimeLine, setItemsTimeLine] = useState([
        { label: 'Select Timeline', value: '' },
        { label: 'Low Priority', value: 'Low-Priority' },
        { label: 'High Priority', value: 'High-Priority' },
    ]);
    const [openTimeLine, setOpenTimeLine] = useState(false);
    const [location, setLocation] = useState("");

    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [other, setOther] = useState(false);

    /**
     * Asynchronously picks an image from the user's media library.
     * Requests permission to access the media library if not already granted.
     * If permission is granted, opens the media library for the user to select an image.
     * If an image is selected and the operation is not canceled, sets the selected image URI.
     *
     * @async
     * @function pickImage
     * @returns {Promise<void>} A promise that resolves when the image picking process is complete.
     */
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

    /**
     * Asynchronously posts an issue to the server.
     * 
     * This function validates the input fields, constructs a FormData object with the issue details,
     * and sends a POST request to the server to create a new issue. It handles loading state, error
     * handling, and resets the form fields upon successful submission.
     * 
     * @async
     * @function postIssue
     * @returns {Promise<void>} A promise that resolves when the issue is posted.
     * @throws Will throw an error if the request fails or if required fields are empty.
     */
    const postIssue = async () => {
        if (!description) {
            Alert.alert("Invalid Description", "Some fields are empty. Please complete everything for the professional to give you the most informed quote!");
            return;
        }

        if (!selectedService) {
            Alert.alert("Invalid Service", "Please select a valid service type.");
            return;
        }

        if (!selectedTimeLine) {
            Alert.alert("Invalid Timeline", "Please select an urgency timeline.");
            return;
        }

        if (!location || location.trim().length < 5) {
            Alert.alert("Invalid Location", "Please provide a valid location with at least 5 characters.");
            return;
        }

        // Optional Image
        if (selectedImage) {
            const validImageTypes = ['image/jpeg', 'image/png'];
            const imageType = selectedImage.split('.').pop().toLowerCase();
            if (!validImageTypes.includes(`image/${imageType}`)) {
                Alert.alert("Invalid Image", "Only JPEG and PNG images are supported.");
                return;
            }
        }

        setLoading(true); // Start loading

        try {
            const token = await AsyncStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email;

            const formData = new FormData();
            formData.append('title', description);
            formData.append('description', description);
            formData.append('professionalNeeded', selectedService);
            formData.append('email', userEmail);
            formData.append('status', "Open");

            if (selectedImage) {
                formData.append('image', {
                    uri: selectedImage,
                    type: `image/${selectedImage.split('.').pop().toLowerCase()}`,
                    name: 'issue_image.jpg',
                });
            }
            console.log("🚀 Sending Data:", {
                title: description,
                description,
                professionalNeeded: selectedService,
                email: userEmail,
                status: "Open",
                image: selectedImage ? "✅ Image Attached" : "❌ No Image",
            });

            const response = await axios.post(`https://fixercapstone-production.up.railway.app/issue/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            console.log("✅ Response:", response.data);

            if (response.status === 201) {
                // Reset all fields to default values
                setDescription('');
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
            console.log("❌ Error:", error.response?.data || error.message);
            Alert.alert('An error occurred. Please try again.');
        } finally {
            setLoading(false); // Stop loading after completion
        }
    };

    /**
     * Handles the selection of an image from either the camera or the media library.
     * Requests the necessary permissions and launches the appropriate image picker.
     * If the user grants permission and selects an image, the image URI is set.
     *
     * @param {string} source - The source of the image, either 'camera' or 'mediaLibrary'.
     * @returns {Promise<void>} - A promise that resolves when the image selection is complete.
     */
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

    /**
     * Counts the number of words in a given text.
     *
     * @param {string} text - The text to count words in.
     * @returns {number} - The number of words in the text.
     */
    const countWords = (text) => {
        return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    };

    /**
     * Removes the currently selected image by setting the selected image state to null.
     */
    const removeImage = () => {
        setSelectedImage(null);
    };

    return (
        //possibility to dismiss the keyboard just by touching the screen
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={{ flexGrow: 1, padding: 20, backgroundColor: '#ffffff'}}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
            >
                <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>Job Description</Text>

                {/* title field */}
                <TextInput
                    placeholder= "Describe your service"
                    value={description}
                    onChangeText={setDescription}
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
                        {description.length} chars
                    </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 2 }}>Select Type</Text>
                <View style={styles.pickerContainer}>
                    <DropDownPicker
                        style={{backgroundColor: '#E7E7E7',borderColor: '#ddd'}}
                        translation={{PLACEHOLDER: "Select Service"}}
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
                {/*Image upload*/}
                <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                        {selectedImage ? (
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                                <TouchableOpacity style={{...styles.removeButton}} onPress={removeImage}>
                                    <Text style={{...styles.removeText}}>✖</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.placeholder}>
                                <Image source={require('../../../assets/folder-add.png')} style={styles.icon} />
                                <Text style={{ ...styles.text }}>Take from your gallery</Text>
                                <Text style={{...styles.supportedFormats}}>Supported formats: JPEG, PNG, MP4</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                {/*map*/}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 37.7749, // Example: San Francisco
                            longitude: -122.4194,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        {/* Marker Example */}
                        <Marker
                            coordinate={{ latitude: 37.7749, longitude: -122.4194 }}
                            title="San Francisco"
                            description="This is a marker in SF!"
                        />
                    </MapView>
                </View>
                {/*location label*/}
                <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 15, marginTop: 20 }}>Location</Text>
                {/* location field */}
                <View style={{ flex: 1 }}>
                    <TextInput
                        placeholder="Enter Location"
                        value={location}
                        onChangeText={setLocation}
                        style={{
                            height: 52,
                            borderWidth: 1,
                            borderColor: "#ddd",
                            backgroundColor: "#E7E7E7",
                            borderRadius: 8,
                            padding: 9,
                        }}
                    />
                </View>
                <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 2, marginTop: 20 }}>Urgency Timeline</Text>
                {/*Urgency Timeline*/}
                <View style={styles.pickerContainer}>
                    <DropDownPicker
                        style={{backgroundColor: '#E7E7E7',borderColor: '#ddd'}}
                        translation={{PLACEHOLDER: "Select Timeline"}}
                        open={openTimeLine}
                        value={selectedTimeLine}
                        items={itemsTimeLine}
                        setOpen={setOpenTimeLine}
                        setValue={setSelectedTimeLine}
                        setItems={setItemsTimeLine}
                        textStyle={{ fontSize: 13, fontWeight: 'bold' }}
                        dropDownDirection="BOTTOM" // Ensures dropdown opens downward
                        dropDownContainerStyle={{ zIndex: 1000 }} // Ensures dropdown renders above other components
                        listMode="SCROLLVIEW" // Uses ScrollView instead of FlatList (fixes VirtualizedLists issue)
                        nestedScrollEnabled={true} // Enables smooth scrolling within ScrollView
                    />
                </View>
                {/* Create Issue Button */ }
                <View>
                    <OrangeButton testID={'post-job-button'} title="Create Job" variant="normal" onPress={postIssue}/>
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}
