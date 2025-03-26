import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../../../style/editIssueStyle';
import { IPAddress } from '../../../ipAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import InputField from "../../../components/inputField";
import {I18n} from "i18n-js";
import {en, fr} from "../../../localization";
import DropdownField from "../../../components/dropdownField";
import OrangeButton from "../../../components/orangeButton";
const i18n = new I18n({ en, fr });

export default function EditIssue({ route, navigation }) {
    const { jobId } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedTimeLine, setSelectedTimeLine] = useState(null);
    const [openTimeLine, setOpenTimeLine] = useState(false);
    const [itemsTimeLine, setItemsTimeLine] = useState([
        { label: `${i18n.t('low_priority')}`, value: 'low-priority'},
        { label: `${i18n.t('high_priority')}`, value: 'high-priority' },
    ]);

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
            const response = await axios.get(`http://${IPAddress}:3000/issue/${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.status === 200) {
                const { title, description, professionalNeeded, image, timeline } = response.data;
                setTitle(title);
                setDescription(description);
                setProfessionalNeeded(professionalNeeded);
                setImage(image);
                setSelectedTimeLine(timeline);
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
        if (!title || title.trim().length < 5) {
            Alert.alert("Invalid Title", "Title must be at least 5 characters long.");
            return;
        }

        if (!professionalNeeded) {
            Alert.alert("Invalid Professional", "Please select a professional type (Plumber/Electrician).");
            return;
        }

        if (!description || description.trim().length < 10) {
            Alert.alert("Invalid Description", "Please provide a description with at least 10 characters.");
            return;
        }

        if (image) {
            const validImageTypes = ['image/jpeg', 'image/png'];
            const imageType = image.split('.').pop().toLowerCase();
            if (!validImageTypes.includes(`image/${imageType}`)) {
                Alert.alert("Invalid Image", "Only JPEG and PNG images are supported.");
                return;
            }
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
            formData.append('timeline', selectedTimeLine);
            if (image) {
                formData.append('image', {
                    uri: image,
                    type: `image/${image.split('.').pop().toLowerCase()}`,
                    name: 'issue_image.jpg',
                });
            }
            const response = await axios.put(`http://${IPAddress}:3000/issue/${jobId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

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
        <ScrollView style={{ flexGrow: 1, padding: 20, backgroundColor: '#ffffff'}}
        >
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('modify_issue')}</Text>
            </View>

            <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 15 }}>{i18n.t('title')}*</Text>
            <InputField
                placeholder={`${i18n.t('title')}`}
                value={title}
                onChangeText={setTitle}
            />
            <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 15 }}>{i18n.t('job_description')}*</Text>
            <InputField
                placeholder={`${i18n.t('describe_your_service')}`}
                value={description}
                onChangeText={setDescription}
                multiline
            />

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
            <OrangeButton
            title={i18n.t('modify_issue')}
            onPress={() => updateJob()}
        />
        </ScrollView>
    );
}
