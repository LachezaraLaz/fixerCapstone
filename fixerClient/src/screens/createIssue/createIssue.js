//import dependencies
import * as React from 'react';
import 'react-native-get-random-values';
import {
    ScrollView,
    View,
    Text,
    Image,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView, 
    Platform ,
} from 'react-native';
import {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';

//import for language translation
import {en, fr} from '../../../localization'
import { I18n } from "i18n-js";
import { LanguageContext } from "../../../context/LanguageContext";

//import components and styles
import OrangeButton from "../../../components/orangeButton";
import InputField from '../../../components/inputField';
import DropdownField from '../../../components/dropdownField';
import ProfessionalSelector from '../../../components/searchAndSelectTagField';
import CustomAlertError from '../../../components/customAlertError';
import CustomAlertSuccess from '../../../components/customAlertSuccess';
import styles from '../../../style/createIssueStyle'

import { IPAddress } from '../../../ipAddress';


/**
 * @module fixerClient
 */

export default function CreateIssue({ navigation }) {
    //translation
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    //AI
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [showAiPreview, setShowAiPreview] = useState(false);

    // List of fields in the page
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState('');
    const [selectedProfessionals, setSelectedProfessionals] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedTimeLine, setSelectedTimeLine] = useState(null);
    const [itemsTimeLine, setItemsTimeLine] = useState([
        { label: `${i18n.t('low_priority')}`, value: 'low-priority'},
        { label: `${i18n.t('high_priority')}`, value: 'high-priority' },
    ]);
    const [openTimeLine, setOpenTimeLine] = useState(false);
    const [useDefaultLocation, setUseDefaultLocation] = useState(true);
    const [defaultLocation, setDefaultLocation] = useState('');
    const [newStreet, setNewStreet] = useState('');
    const [newPostalCode, setNewPostalCode] = useState('');
    const [coordinates, setCoordinates] = useState(null);
    const [isAddressValid, setIsAddressValid] = useState(false);
    const [loading, setLoading] = useState(false);

    //const for custom alerts
    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertContent, setCustomAlertContent] = useState({ title: '', message: '' });
    const [successAlertVisible, setSuccessAlertVisible] = useState(false);
    const [successAlertContent, setSuccessAlertContent] = useState({ title: '', message: '' });
      

    /**
     * Asynchronously handles the enhancement of a job description using an AI service.
     * If the description is empty, an alert prompts the user to enter a description first.
     * Once the description is provided, it sends the description to the AI endpoint for enhancement.
     * If the AI enhancement is successful, the improved description is displayed for preview.
     * If an error occurs, it handles specific errors (e.g., invalid category or general errors) and shows appropriate alerts.
     *
     * @async
     * @function handleAiEnhancement
     * @returns {Promise<void>} A promise that resolves when the AI enhancement process is complete.
     */
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

    /**
     * Accepts the AI-generated description suggestion and updates the description field.
     * The AI suggestion is set as the new description, and the AI preview is hidden.
     *
     * @function handleAcceptAiSuggestion
     * @returns {void} This function does not return a value.
     */
    const handleAcceptAiSuggestion = () => {
        setDescription(aiSuggestion);
        setShowAiPreview(false);
    };

    /**
     * Rejects the AI-generated description suggestion and clears the suggestion.
     * The AI suggestion is reset to an empty string, and the AI preview is hidden.
     *
     * @function handleRejectAiSuggestion
     * @returns {void} This function does not return a value.
     */
    const handleRejectAiSuggestion = () => {
        setAiSuggestion('');
        setShowAiPreview(false);
    };


    /**
     * Asynchronously requests permission to access the user's media library and allows them to select an image.
     * If permission is granted, the media library is opened for the user to pick an image.
     * If the image selection is not canceled, the URI of the selected image is set.
     * If permission is not granted, the user is alerted to grant permission through phone settings.
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
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    /**
     * Removes the selected image by setting the selected image to null.
     * This effectively clears the image from the user's selection.
     *
     * @function removeImage
     * @returns {void} This function does not return a value.
     */
    const removeImage = () => {
        setSelectedImage(null);
    };


    /**
     * Asynchronously fetches the user's profile information from the server.
     * It retrieves the user's token from AsyncStorage and uses it to make an authenticated GET request to fetch the profile data.
     * If the profile contains a street and postal code, they are set as the default location.
     * If the profile response is missing either the street or postal code, a warning is logged.
     * Any errors during the fetch operation are caught and logged to the console.
     *
     * @async
     * @function fetchUserProfile
     * @returns {Promise<void>} A promise that resolves when the profile fetch process is complete.
     */
    useEffect(() => {
        fetchUserProfile();
    }, []);
      
    const fetchUserProfile = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
      
          const response = await axios.get(`https://fixercapstone-production.up.railway.app/client/profile/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const { street, postalCode } = response.data;
      
          if (street && postalCode) {
            setDefaultLocation(`${street}, ${postalCode}`);
          } else {
            console.warn('⚠️ Missing street or postal code in profile response');
          }
      
        } catch (error) {
          console.error('❌ Failed to fetch profile:', error);
        }
    };


    /**
     * Formats a postal code input by removing all non-alphanumeric characters and ensuring it follows a specific pattern.
     * The postal code is first converted to uppercase and restricted to a maximum of 6 characters before formatting.
     * A space is inserted after the first three characters if enough characters exist.
     * The final result is limited to 7 characters (e.g., A1B 2C3).
     * The formatted postal code is then set to the `newPostalCode` state.
     *
     * @function formatPostalCode
     * @param {string} text - The raw postal code input to be formatted.
     * @returns {void} This function does not return a value.
     */
    const formatPostalCode = (text) => {
        // Remove all non-alphanumeric characters
        let formattedText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
        // Limit to 6 characters (A1B2C3) before formatting
        formattedText = formattedText.slice(0, 6);
    
        // Insert space after the first 3 characters if enough characters exist
        if (formattedText.length > 3) {
            formattedText = `${formattedText.slice(0, 3)} ${formattedText.slice(3)}`;
        }
    
        // Limit final result to 7 characters (A1B 2C3)
        formattedText = formattedText.slice(0, 7);
    
        setNewPostalCode(formattedText);
    };


    /**
     * Asynchronously verifies the user's address by sending a request to a server with the street and postal code.
     * If the default location is used, the stored default address is sent; otherwise, the newly entered street and postal code are sent.
     * The server response provides coordinates and a flag indicating if the address is valid.
     * The coordinates and validity status are then stored in the respective state variables.
     * If an error occurs during the verification process, an alert is shown to inform the user.
     *
     * @async
     * @function verifyAddress
     * @returns {Promise<void>} A promise that resolves when the address verification process is complete.
     */
    const verifyAddress = async () => {
        try {
            const response = await axios.post('https://fixercapstone-production.up.railway.app/client/verifyAddress', {
                street: useDefaultLocation ? defaultLocation : newStreet,
                postalCode: useDefaultLocation ? defaultLocation.split(',')[1]?.trim() : newPostalCode,
            });
    
            const { coordinates, isAddressValid } = response.data;
            setCoordinates(coordinates);
            setIsAddressValid(isAddressValid);
        } catch (error) {
            console.log("❌ Address verification error:", error);
            setCustomAlertContent({
                title: "Address Error",
                message: "Could not verify the address. Please double-check your info.",
            });
            setCustomAlertVisible(true);
        }
    };  


    /**
     * Validates the form by checking if all required fields are filled and meet the necessary conditions.
     * The form is considered valid if:
     * - The title and description are not empty.
     * - At least one professional is selected.
     * - A timeline is selected.
     * - Either the default location is used, or the address is verified as valid.
     *
     * @function isFormValid
     * @returns {boolean} Returns true if all form conditions are met, otherwise false.
     */
    const isFormValid = () => {
        return (
          title &&
          description &&
          selectedProfessionals.length > 0 &&
          selectedTimeLine &&
          (useDefaultLocation || isAddressValid)
        );
    };

    /**
     * Asynchronously posts a new job/issue to the server if the form is valid.
     * The function first checks if all required fields are completed. If any fields are missing or invalid, an alert is shown.
     * If the form is valid, it sends a POST request to the server with the job details, including the title, description, selected professionals, email, status, timeline, address, and optionally an image.
     * If the request is successful (status 201), the form is reset, and a success alert is shown.
     * If any error occurs during the posting process, an error alert is displayed with a message.
     *
     * @async
     * @function postIssue
     * @returns {Promise<void>} A promise that resolves when the issue is posted.
     * @throws Will throw an error if the request fails or if required fields are empty.
     */
    const postIssue = async () => {

        if (!isFormValid()){
            setCustomAlertContent({
                title: "Missing Fields",
                message: "Some fields are empty. Please complete everything for the professional to provide the most informed quote!",
            });
            setCustomAlertVisible(true);
            return;
        }
          
        setLoading(true); // Start loading

        try {
            const token = await AsyncStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email;

            // Create a full address for geocoding
            const fullAddress = useDefaultLocation
            ? defaultLocation
            : `${newStreet}, ${newPostalCode}`;

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('professionalNeeded', selectedProfessionals.join(', '));
            formData.append('email', userEmail);
            formData.append('status', "open");
            formData.append('timeline', selectedTimeLine);
            formData.append('imageUrl', selectedImage);
            formData.append('address', fullAddress); 

            if (selectedImage) {
                formData.append('image', {
                    uri: selectedImage,
                    type: 'image/*',
                    name: 'issue_image.jpg',
                });
            }
            console.log("🚀 Sending Data:", {
                title: title,
                description: description,
                professionalNeeded: selectedProfessionals,
                email: userEmail,
                status: "Open",
                image: selectedImage ? "✅ Image Attached" : "❌ No Image",
                address: fullAddress,
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
                setSelectedProfessionals([]);
                setSelectedImage(null);
                setSelectedTimeLine(null);

                setSuccessAlertContent({
                    title: i18n.t('job_posted_successfully'),
                    message: i18n.t('your_job_has_been_posted'),
                });
                setSuccessAlertVisible(true);
            } else {
                setCustomAlertContent({
                    title: "Error",
                    message: "Failed to post the job.",
                });
                setCustomAlertVisible(true);
            }
        } catch (error) {
            console.log("❌ Error:", error.response?.data || error.message);
            setCustomAlertContent({
                title: "Error",
                message: "An error occurred. Please try again.",
            });
            setCustomAlertVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        //possibility to dismiss the keyboard just by touching the screen
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // adjust as needed
            >
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
                                    <Text style={{...styles.supportedFormats}}>JPEG, PNG, HEIC, MP4</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 2, marginTop: 30 }}>{i18n.t('select_timeline')}*</Text>
                    <View style={styles.pickerContainer}>
                        <DropdownField
                            translation={{ PLACEHOLDER: `${i18n.t('select_timeline')}` }}
                            placeholder={i18n.t('select_timeline')}
                            open={openTimeLine}
                            items={itemsTimeLine}
                            value={selectedTimeLine}
                            setOpen={setOpenTimeLine}
                            setItems={setItemsTimeLine}
                            setValue={setSelectedTimeLine}
                        />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 20, marginTop:30 }}>{i18n.t('location')}*</Text>

                    <View style={{ marginBottom: 16 }}>
                        {/* Use default location */}
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
                            onPress={() => setUseDefaultLocation(true)}
                        >
                            <Ionicons
                            name={useDefaultLocation ? 'radio-button-on' : 'radio-button-off'}
                            size={20}
                            color="#1E90FF"
                            />
                            <Text style={{ marginLeft: 10, fontSize: 15 }}>
                            {i18n.t('use_default_address')}
                            </Text>
                        </TouchableOpacity>

                        {defaultLocation && (
                            <Text style={{ marginLeft: 30, color: '#888', fontSize: 13, marginBottom: 10 }}>
                            {defaultLocation}
                            </Text>
                        )}

                        {/* Enter other location */}
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => setUseDefaultLocation(false)}
                        >
                            <Ionicons
                            name={!useDefaultLocation ? 'radio-button-on' : 'radio-button-off'}
                            size={20}
                            color="#1E90FF"
                            />
                            <Text style={{ marginLeft: 10, fontSize: 15 }}>{i18n.t('enter_new_address')}</Text>
                        </TouchableOpacity>
                    </View>


                    {!useDefaultLocation && (
                        <View style={{ marginBottom: 20 }}>
                            <InputField
                            placeholder={i18n.t('street_address')}
                            value={newStreet}
                            onChangeText={setNewStreet}
                            />
                            <InputField
                            placeholder={i18n.t('postal_code')}
                            value={newPostalCode}
                            onChangeText={formatPostalCode}
                            />
                            <OrangeButton
                                title={i18n.t('verify_address')}
                                onPress={verifyAddress}
                                variant="normal"
                            />

                            {isAddressValid && coordinates && (
                                <>
                                    <Text style={{ marginTop: 10, color: 'green' }}>
                                        ✅ {i18n.t('valid_address_entered')}
                                    </Text>
                                    <MapView
                                        style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }}
                                        initialRegion={{
                                            latitude: coordinates.latitude,
                                            longitude: coordinates.longitude,
                                            latitudeDelta: 0.005,
                                            longitudeDelta: 0.005,
                                        }}
                                    >
                                        <Marker coordinate={coordinates} />
                                    </MapView>
                                </>
                            )}
                        </View>
                        
                    )}


                    {/* Create Issue Button */ }
                    <View>
                        <OrangeButton
                            testID={'post-job-button'}
                            title={i18n.t('create_job')}
                            variant="normal"
                            onPress={postIssue}
                            disabled={!isFormValid() || loading}
                        />

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
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#FF8C00" />
                        <Text style={styles.loadingText}>{i18n.t('posting_your_job')}</Text>
                    </View>
                )}
            </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}