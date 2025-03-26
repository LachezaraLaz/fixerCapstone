import React, { useState } from 'react';
import {View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, KeyboardAvoidingView} from 'react-native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from '../../../style/contractOffer/contractOfferStyle';
// import { IPAddress } from '../../../ipAddress';
import CustomAlertSuccess from '../../../components/customAlertSuccess';
import CustomAlertError from '../../../components/customAlertError';

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
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Unable to fetch user address.'
            );
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

        if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
            setErrorAlertContent({
                title: 'Invalid Price',
                message: 'Please enter a valid positive number for the price.'
            });
            setErrorAlertVisible(true);
            return;
        }

        if (parsedPrice > 100000) {
            setErrorAlertContent({
                title: 'Invalid Price',
                message: 'Price should not exceed $100,000.'
            });
            setErrorAlertVisible(true);
            return;
        }

        // Ensures that selectedIssue has necessary details
        if (!selectedIssue || !selectedIssue.userEmail || !selectedIssue.id) {
            setErrorAlertContent({
                title: 'Error',
                message: 'Unable to retrieve complete issue details. Please try again.'
            });
            setErrorAlertVisible(true);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setErrorAlertContent({
                    title: 'Error',
                    message: 'User token not found.'
                });
                setErrorAlertVisible(true);
                return;
            }


            if (!selectedIssue || !selectedIssue.userEmail) {
                console.log('clientEmail is null or undefined');
                Alert.alert('Error', 'Unable to retrieve client email from the selected issue.');
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
                    message: 'Failed to submit the quote.'
                });
                setErrorAlertVisible(true);
            }
        } catch (error) {
            if (error.response?.status === 400) {
                setErrorAlertContent({
                    title: 'Error',
                    message: 'You have already submitted a quote for this issue.'
                });
                setErrorAlertVisible(true);
            } else {
                console.error('Error submitting quote:', error);
                setErrorAlertContent({
                    title: 'Error',
                    message: 'An error occurred while submitting the quote.'
                });
                setErrorAlertVisible(true);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.containerTitle}>
                    <Text style={styles.title}>{issue.title}</Text>
                </View>

                <Text style={styles.label}>Job Description</Text>
                <TextInput
                    style={[styles.inputContainer, { height: 150, textAlignVertical: 'top' }]}
                    placeholder="Describe your service"
                    value={jobDescription}
                    onChangeText={setJobDescription}
                    multiline
                />

                <Text style={styles.label}>Tools-Materials</Text>
                <TextInput
                    style={[styles.inputContainer, { height: 150, textAlignVertical: 'top' }]}
                    placeholder="Enter Here"
                    value={toolsMaterials}
                    onChangeText={setToolsMaterials}
                    multiline
                />

                <Text style={styles.label}>Terms and Conditions</Text>
                <TextInput
                    style={[styles.inputContainer, { height: 150, textAlignVertical: 'top' }]}
                    placeholder="Enter Here"
                    value={termsConditions}
                    onChangeText={setTermsConditions}
                    multiline
                />

                <Text style={styles.labelPrice}>Pricing $ (Hourly Rate)</Text>
                <TextInput
                    placeholder="50"
                    value={price}
                    keyboardType="numeric"
                    onChangeText={setPrice}
                    style={[styles.input, { height: 40 }]}
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
                onClose={() => setErrorAlertVisible(false)}
            />
        </KeyboardAvoidingView>
    );
}

