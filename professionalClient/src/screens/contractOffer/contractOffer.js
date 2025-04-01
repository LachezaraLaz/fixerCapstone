import React, { useState } from 'react';
import {View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, KeyboardAvoidingView} from 'react-native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from '../../../style/contractOffer/contractOfferStyle';
import {Ionicons} from "@expo/vector-icons";

// import { IPAddress } from '../../../ipAddress';
import CustomAlertSuccess from '../../../components/customAlertSuccess';
import CustomAlertError from '../../../components/customAlertError';
import InputField from "../../../components/inputField";

/**
 * @module professionalClient
 */

export default function ContractOffer({ route, navigation }) {
    const { issue } = route.params;
    const [price, setPrice] = React.useState('');
    const [selectedIssue, setSelectedIssue] = React.useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [toolsMaterials, setToolsMaterials] = useState('');
    const [termsConditions, setTermsConditions] = useState('');
    const [successAlertVisible, setSuccessAlertVisible] = useState(false);
    const [successAlertContent, setSuccessAlertContent] = useState({ title: '', message: '' });
    const [errorAlertVisible, setErrorAlertVisible] = useState(false);
    const [errorAlertContent, setErrorAlertContent] = useState({ title: '', message: '' });
    const [jobDescriptionError, setJobDescriptionError] = useState(false);
    const [toolsMaterialsError, setToolsMaterialsError] = useState(false);
    const [termsConditionsError, setTermsConditionsError] = useState(false);
    const [priceError, setPriceError] = useState(false);


    /**
     * Fetches the user profile based on the provided email.
     *
     * @param {string} email - The email of the user whose profile is to be fetched.
     * @returns {Promise<void>} - A promise that resolves when the user profile is fetched and the user address is set.
     * @throws {Error} - Throws an error if the user profile cannot be fetched.
     */
    const fetchUserProfile = async (email) => {
        try {

            const token = await AsyncStorage.getItem('token');

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/users/user/${email}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Handle a successful response
            if (response.status === 200) {
                setUserAddress({
                    street: response.data.street,
                    postalCode: response.data.postalCode,
                    provinceOrState: response.data.provinceOrState,
                    country: response.data.country,
                });
            }
        } catch (error) {
            // Log detailed error information for debugging
            console.error(
                'Error fetching user profile:',
                error.response?.data || error.message
            );

            // Show an error alert to the user
            setErrorAlertContent({
                title: "Error",
                message: error.response?.data?.message || "Unable to fetch user address.",
            });
            setCustomAlertVisible(true);
        }
    };

    React.useEffect(() => {
        if (issue) {
            setSelectedIssue(issue);
            fetchUserProfile(issue.userEmail);
        }
    }, [issue]);

    /**
     * Submits a quote for the selected issue.
     *
     * This function checks if a price is entered and retrieves the user token from AsyncStorage.
     * It then validates the selected issue and client email before sending a POST request to create a quote.
     * If the quote is successfully submitted, an alert is shown and the user is navigated back.
     * If an error occurs, appropriate error messages are displayed.
     *
     * @async
     * @function submitQuote
     * @returns {Promise<void>}
     */
    const submitQuote = async () => {
        const parsedPrice = parseFloat(price);

        // Reset all errors before validating again
        setJobDescriptionError(false);
        setToolsMaterialsError(false);
        setTermsConditionsError(false);
        setPriceError(false);

        // Validate Job Description
        if (!jobDescription.trim()) {
            setJobDescriptionError(true);
            setErrorAlertContent({
                title: 'Missing Job Description',
                message: 'Please enter a job description.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => setErrorAlertVisible(false)
                    }
                ]
            });            
            setErrorAlertVisible(true);
            return;
        }

        // Validate Tools-Materials
        if (!toolsMaterials.trim()) {
            setToolsMaterialsError(true);
            setErrorAlertContent({
                title: 'Missing Tools and Materials',
                message: 'Please specify the tools and materials required.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => setErrorAlertVisible(false)
                    }
                ]
            });            
            setErrorAlertVisible(true);
            return;
        }

        // Validate Terms and Conditions
        if (!termsConditions.trim()) {
            setTermsConditionsError(true);
            setErrorAlertContent({
                title: 'Missing Terms and Conditions',
                message: 'Please specify terms and conditions.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => setErrorAlertVisible(false)
                    }
                ]
            });            
            setErrorAlertVisible(true);
            return;
        }

        // Validate Price
        const isValidNumber = /^\d+$/.test(price);
        if (!price || !isValidNumber|| isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 100000) {
            setPriceError(true);
            setErrorAlertContent({
                title: 'Invalid Price',
                message: 'Please enter a valid positive number (less than $100,000) for the price.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => setErrorAlertVisible(false)
                    }
                ]
            });            
            setErrorAlertVisible(true);
            return;
        }

        // Ensures that selectedIssue has necessary details
        if (!selectedIssue || !selectedIssue.userEmail || !selectedIssue.id) {
            setErrorAlertContent({
                title: 'Error',
                message: 'Unable to retrieve complete issue details. Please try again.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => setErrorAlertVisible(false)
                    }
                ]
            });            
            setErrorAlertVisible(true);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setErrorAlertContent({
                    title: 'Error',
                    message: 'User token not found.',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => setErrorAlertVisible(false)
                        }
                    ]
                });                
                setErrorAlertVisible(true);
                return;
            }


            if (!selectedIssue || !selectedIssue.userEmail) {
                console.log('clientEmail is null or undefined');
                setErrorAlertContent({
                    title: 'Error',
                    message: 'Unable to retrieve client email from the selected issue.',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => setErrorAlertVisible(false)
                        }
                    ]
                });
                setErrorAlertVisible(true);
                //Alert.alert('Error', 'Unable to retrieve client email from the selected issue.');
                return;
            }

            const issueTitle = selectedIssue.title; // Get the issue title
            const clientEmail = selectedIssue.userEmail; // Use userEmail from the schema
            const issueId = selectedIssue._id || selectedIssue.id;

            // Prepare the quote object
            const quoteData = {
                clientEmail,
                issueTitle,
                issueId,
                price: parsedPrice,
                jobDescription,
                toolsMaterials,
                termsConditions,
            };


            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/quotes/create`,
                quoteData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                setSuccessAlertContent({
                    title: 'Success',
                    message: 'Quote submitted successfully!'
                });
                setSuccessAlertVisible(true);
            } else {
                setErrorAlertContent({
                    title: 'Error',
                    message: 'Failed to submit the quote.',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => setErrorAlertVisible(false)
                        }
                    ]
                });                
                setErrorAlertVisible(true);
            }
        } catch (error) {
            if (error.response?.status === 400) {
                setErrorAlertContent({
                    title: 'Error',
                    message: 'You have already submitted a quote for this issue.',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => setErrorAlertVisible(false)
                        }
                    ]
                });
                
                setErrorAlertVisible(true);
            } else {
                console.error('Error submitting quote:', error);
                setErrorAlertContent({
                    title: 'Error',
                    message: 'An error occurred while submitting the quote.',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => setErrorAlertVisible(false)
                        }
                    ]
                });
                
                setErrorAlertVisible(true);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
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
                            <Ionicons name="arrow-back" size={28} color='#ff8c00' />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Submit a Quote</Text>
                    </View>
                <View style={styles.containerTitle}>
                    <Text style={styles.title}>{issue.title}</Text>
                </View>

                <Text style={styles.label}>Job Description*</Text>
                <InputField
                    style={[
                        styles.inputContainer,
                        { height: 150, textAlignVertical: 'top' },
                        jobDescriptionError && { borderColor: 'red', borderWidth: 1 }
                    ]}
                    placeholder="Describe your service"
                    value={jobDescription}
                    onChangeText={(text) => {
                        setJobDescription(text);
                        setJobDescriptionError(false);
                    }}
                    multiline
                />

                <Text style={styles.label}>Tools-Materials*</Text>
                <InputField
                    style={[
                        styles.inputContainer,
                        { height: 150, textAlignVertical: 'top' },
                        toolsMaterialsError && { borderColor: 'red', borderWidth: 1 }
                    ]}
                    placeholder="Enter Here"
                    value={toolsMaterials}
                    onChangeText={(text) => {
                        setToolsMaterials(text);
                        setToolsMaterialsError(false);
                    }}
                    multiline
                />

                <Text style={styles.label}>Terms and Conditions*</Text>
                <InputField
                    style={[
                        styles.inputContainer,
                        { height: 150, textAlignVertical: 'top' },
                        termsConditionsError && { borderColor: 'red', borderWidth: 1 }
                    ]}
                    placeholder="Enter Here"
                    value={termsConditions}
                    onChangeText={(text) => {
                        setTermsConditions(text);
                        setTermsConditionsError(false);
                    }}
                    multiline
                />

                <Text style={styles.labelPrice}>Pricing $ (Hourly Rate)*</Text>
                <InputField
                    placeholder="50"
                    value={price}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                        setPrice(text);
                        setPriceError(false);
                    }}
                    style={[
                        styles.input,
                        { height: 40 },
                        priceError && { borderColor: 'red', borderWidth: 1 }
                    ]}
                />

                <TouchableOpacity onPress={submitQuote} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Submit Quote</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Custom Success Alert */}
            <CustomAlertSuccess
                visible={successAlertVisible}
                title={successAlertContent.title}
                message={successAlertContent.message}
                onClose={() => {
                    setSuccessAlertVisible(false);
                    navigation.goBack(); // Redirect after success
                }}
            />

            {/* Custom Error Alert */}
            <CustomAlertError
                visible={errorAlertVisible}
                title={errorAlertContent.title}
                message={errorAlertContent.message}
                buttons={errorAlertContent.buttons}
                onClose={() => setErrorAlertVisible(false)}
            />
            </View>
        </KeyboardAvoidingView>
    );
}

