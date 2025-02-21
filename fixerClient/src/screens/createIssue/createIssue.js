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
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

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
            <ScrollView style={{ flexGrow: 1, padding: 20, backgroundColor: '#ffffff'}}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
            >
                <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>Job Description</Text>

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
                    <GooglePlacesAutocomplete
                        placeholder="Enter Location"
                        keyboardShouldPersistTaps="handled" // Prevents touch event conflicts
                        fetchDetails={true} // Gets extra details like lat/lng
                        onPress={(data, details = null) => {
                            console.log("Selected Location:", data.description);
                            console.log("Coordinates:", details?.geometry.location);
                        }}
                        query={{
                            key: process.env.GOOGLE_MAPS_KEY, // Replace with your API Key
                            language: "en",
                            components: "country:ca"
                        }}
                        styles={{
                            textInput: {
                                height: 52,
                                borderWidth: 1,
                                borderColor: "#ddd",
                                backgroundColor: "#E7E7E7",
                                borderRadius: 8,
                                padding: 9,
                            },
                        }}
                        nestedScrollEnabled={true} // Allows smooth scrolling inside ScrollView
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
                    <OrangeButton title="Create Job" variant="normal" />
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}
