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
import {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';

import { IPAddress } from '../../../ipAddress';
import OrangeButton from "../../../components/orangeButton";
import MapView, { Marker } from "react-native-maps";
import {en, fr} from '../../../localization'
import { I18n } from "i18n-js";
import { LanguageContext } from "../../../context/LanguageContext";
import { Ionicons } from '@expo/vector-icons';

import InputField from '../../../components/inputField';
import DropdownField from '../../../components/dropdownField';
import ProfessionalSelector from '../../../components/searchAndSelectTagField';
import CustomAlertError from '../../../components/customAlertError';
import CustomAlertSuccess from '../../../components/customAlertSuccess';



/**
 * @module fixerClient
 */

export default function CreateIssue({ navigation }) {
    //translation
    let [modalVisible, setModalVisible] = useState(false);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;
    //AI
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [showAiPreview, setShowAiPreview] = useState(false);
    // List of fields in the page
    const [description, setDescription] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [items, setItems] = useState([
        { label: `${i18n.t('select_service')}`, value: '' },
        { label: `${i18n.t('plumbing')}`, value: 'plumbing' },
        { label: `${i18n.t('electrical')}`, value: 'electrical' },
    ]);
    const [selectedImage, setSelectedImage] = useState(null);
    {/*TimeLine Dropdown*/}
    const [open, setOpen] = useState(false);
    const [selectedTimeLine, setSelectedTimeLine] = useState(null);
    const [itemsTimeLine, setItemsTimeLine] = useState([
        { label: `${i18n.t('select_timeline')}`, value: '' },
        { label: `${i18n.t('low_priority')}`, value: 'low-priority'},
        { label: `${i18n.t('high_priority')}`, value: 'high-priority' },
    ]);
    const [openTimeLine, setOpenTimeLine] = useState(false);
    const [location, setLocation] = useState("");
    const [title, setTitle] = useState("");
    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [other, setOther] = useState(false);

    const [selectedProfessionals, setSelectedProfessionals] = useState([]);
    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertContent, setCustomAlertContent] = useState({ title: '', message: '' });
    const [successAlertVisible, setSuccessAlertVisible] = useState(false);
    const [successAlertContent, setSuccessAlertContent] = useState({ title: '', message: '' });



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
            setCustomAlertContent({
                title: "Permission Required",
                message: "Please allow access to your gallery through your phone settings App",
            });
            setCustomAlertVisible(true);
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
    const handleAiEnhancement = async () => {
        if (!description.trim()) {
            Alert.alert('No text', 'Please enter some description first.');
            return;
        }

        try {
            setLoadingAi(true);
            // Call AI endpoint
            const response = await axios.post(
                'https://fixercapstone-production.up.railway.app/issue/aiEnhancement',
                { description }
            );

            const { improvedDescription } = response.data;
            setAiSuggestion(improvedDescription);
            setShowAiPreview(true);
        } catch (error) {
            // Handle 400 Bad Request (Invalid Category)
            if (error.response && error.response.status === 400) {
                setCustomAlertContent({
                    title: 'Invalid Job Category',
                    message: error.response?.data?.error || 'Please provide a home service or blue-collar job description.',
                });
                setCustomAlertVisible(true);                  
            } else {
                console.error('Error enhancing description:', error);
                setCustomAlertContent({
                    title: 'Error',
                    message: 'Could not enhance your description. Please try again.',
                });
                setCustomAlertVisible(true);
            }
        } finally {
            setLoadingAi(false);
        }
    };

    const handleAcceptAiSuggestion = () => {
        setDescription(aiSuggestion);
        setShowAiPreview(false);
    };

    const handleRejectAiSuggestion = () => {
        setAiSuggestion('');
        setShowAiPreview(false);
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
        if (!title) {
            setCustomAlertContent({
                title: "Invalid Title",
                message: "Some fields are empty. Please complete everything for the professional to give you the most informed quote!",
            });
            setCustomAlertVisible(true);
            return;
        }

        if (!description) {
            setCustomAlertContent({
                title: "Invalid Description",
                message: "Some fields are empty. Please complete everything for the professional to give you the most informed quote!",
            });
            setCustomAlertVisible(true);
            return;
        }

        if (!selectedProfessionals) {
            setCustomAlertContent({
                title: "Invalid Service Type",
                message: "Please select service type(s).",
            });
            setCustomAlertVisible(true);
            return;
        }

        if (!selectedTimeLine) {
            setCustomAlertContent({
                title: "Invalid Timeline",
                message: "Please select an urgency timeline.",
            });
            setCustomAlertVisible(true);
            return;
        }

        // if (!location || location.trim().length < 5) {
        //     Alert.alert("Invalid Location", "Please provide a valid location with at least 5 characters.");
        //     return;
        // }

        // Optional Image
        if (selectedImage) {
            const validImageTypes = ['image/jpeg', 'image/png'];
            const imageType = selectedImage.split('.').pop().toLowerCase();
            if (!validImageTypes.includes(`image/${imageType}`)) {
                setCustomAlertContent({
                    title: "Invalid Image",
                    message: "Only JPEG and PNG images are supported.",
                });
                setCustomAlertVisible(true);
                return;
            }
        }

        setLoading(true); // Start loading

        try {
            const token = await AsyncStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email;

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('professionalNeeded', selectedProfessionals.join(', '));
            formData.append('email', userEmail);
            formData.append('status', "open");
            formData.append('timeline', selectedTimeLine);
            formData.append('imageUrl', selectedImage);

            if (selectedImage) {
                formData.append('image', {
                    uri: selectedImage,
                    type: `image/${selectedImage.split('.').pop().toLowerCase()}`,
                    name: 'issue_image.jpg',
                });
            }
            console.log("🚀 Sending Data:", {
                title: title,
                description: description,
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
                setTitle('');
                setDescription('');
                setProfessionalNeeded('');
                setImage(null);
                setOther(false);

                setSuccessAlertContent({
                    title: i18n.t('job_posted_successfully'),
                    message: i18n.t('your_job_has_been_posted'),
                });
                setSuccessAlertVisible(true);
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
    // const handleImageSelection = async (source) => {
    //     const permissionResult = source === 'camera'
    //         ? await ImagePicker.requestCameraPermissionsAsync()
    //         : await ImagePicker.requestMediaLibraryPermissionsAsync();

    //     if (!permissionResult.granted) {
    //         Alert.alert("Permission required", `Please allow access to your ${source}.`);
    //         return;
    //     }

    //     const result = source === 'camera'
    //         ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 })
    //         : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });

    //     if (!result.canceled) {
    //         setSelectedImage(result.assets[0].uri);
    //     }
    // };

    /**
     * Counts the number of words in a given text.
     *
     * @param {string} text - The text to count words in.
     * @returns {number} - The number of words in the text.
     */
    // const countWords = (text) => {
    //     return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    // };

    /**
     * Removes the currently selected image by setting the selected image state to null.
     */
    const removeImage = () => {
        setSelectedImage(null);
    };

    return (
        //possibility to dismiss the keyboard just by touching the screen
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flexGrow: 1, padding: 20, backgroundColor: '#ffffff'}}
                            contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
                            keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            testID="back-button"
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={28} color="#1E90FF" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>{i18n.t('create_job')}</Text>
                    </View>

                    {/* title field */}
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 15 }}>{i18n.t('title')}*</Text>
                    <InputField 
                        placeholder={`${i18n.t('title')}`}
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* description field */}
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 15 }}>{i18n.t('job_description')}*</Text>
                    <View style={{ position: 'relative' }}>

                        <InputField 
                            placeholder={`${i18n.t('describe_your_service')}`}
                            value={description}
                            onChangeText={setDescription}
                            multiline/>

                        {/* AI Enhancement Button */}
                        <TouchableOpacity
                            style={[styles.aiEnhanceButton, { marginTop: 10 }]}
                            onPress={handleAiEnhancement}
                            disabled={loadingAi}
                        >
                            {loadingAi ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>AI</Text>
                            )}
                        </TouchableOpacity>
                        {/* Show AI preview */}
                        {showAiPreview && (
                            <View style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,
                                padding: 10,
                                marginTop: 20,
                                backgroundColor: '#f9f9f9'
                            }}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
                                    AI's Suggestion:
                                </Text>
                                <Text style={{ color: '#333', marginBottom: 16 }}>{aiSuggestion}</Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <TouchableOpacity style={{
                                        backgroundColor: 'green',
                                        padding: 10,
                                        borderRadius: 8,
                                        marginRight: 10
                                    }}
                                        onPress={handleAcceptAiSuggestion}
                                    >
                                        <Text style={{ color: '#fff' }}>Accept</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{
                                        backgroundColor: 'red',
                                        padding: 10,
                                        borderRadius: 8
                                    }}
                                        onPress={handleRejectAiSuggestion}
                                    >
                                        <Text style={{ color: '#fff' }}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Word & Character Counter - Positioned Below the Input */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 12, color: '#555', marginRight: 10 }}>
                            {description.length} chars
                        </Text>
                    </View>

                    {/* Service type selector field */}
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 2 }}>{i18n.t('select_service_type')}*</Text>
                    <View style={styles.pickerContainer}>

                        <Text style={ styles.badgeInfo }>
                            {i18n.t('badges_remaining', { count: 2 - selectedProfessionals.length })}
                        </Text>
                        <ProfessionalSelector
                            selectedProfessionals={selectedProfessionals}
                            setSelectedProfessionals={setSelectedProfessionals}
                        />
                    </View>

                    {/* Image upload label */}
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 15 }}>{i18n.t('image')}</Text>
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
                                    <Text style={{ ...styles.text }}>{i18n.t('take_from_your_gallery')}</Text>
                                    <Text style={{...styles.supportedFormats}}>JPEG, PNG, MP4</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                {/* map
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
                        <Marker
                            coordinate={{ latitude: 37.7749, longitude: -122.4194 }}
                            title="San Francisco"
                            description="This is a marker in SF!"
                        />
                    </MapView>
                </View> */}
                {/*location label*/}
                {/* <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 15, marginTop: 20 }}>{i18n.t('location')}</Text> */}
                {/* location field */}
                {/* <View style={{ flex: 1 }}>
                    <TextInput
                        placeholder={i18n.t('enter_location')}
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
                </View> */}
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 2, marginTop: 30 }}>{i18n.t('select_timeline')}*</Text>
                    <View style={styles.pickerContainer}>
                        <DropdownField
                            translation={{ PLACEHOLDER: `${i18n.t('select_timeline')}` }}
                            open={openTimeLine}
                            items={itemsTimeLine}
                            value={selectedTimeLine}
                            setOpen={setOpenTimeLine}
                            setItems={setItemsTimeLine}
                            setValue={setSelectedTimeLine}
                        />
                    </View>
                    {/* Create Issue Button */ }
                    <View>
                        <OrangeButton testID={'post-job-button'} title={i18n.t('create_job')} variant="normal" onPress={postIssue}/>
                    </View>
                </ScrollView>
                
                <CustomAlertError
                    visible={customAlertVisible}
                    title={customAlertContent.title}
                    message={customAlertContent.message}
                    onClose={() => setCustomAlertVisible(false)}
                />
                <CustomAlertSuccess
                    visible={successAlertVisible}
                    title={successAlertContent.title}
                    message={successAlertContent.message}
                    onClose={() => {
                        setSuccessAlertVisible(false);
                        navigation.goBack(); // If you want to redirect after success
                    }}
                />

            </View>
        </TouchableWithoutFeedback>
    );
}