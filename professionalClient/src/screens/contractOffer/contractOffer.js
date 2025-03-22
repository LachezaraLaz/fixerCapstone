import React, { useState } from 'react';
import {View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform, KeyboardAvoidingView} from 'react-native';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from '../../../style/contractOffer/contractOfferStyle';
// import { IPAddress } from '../../../ipAddress';

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
    // const [startTime, setStartTime] = useState(new Date());
    // const [completionTime, setCompletionTime] = useState(new Date());
    // const [showStartPicker, setShowStartPicker] = useState(false);
    // const [showCompletionPicker, setShowCompletionPicker] = useState(false);

    /**
     * Fetches the user profile based on the provided email.
     *
     * @param {string} email - The email of the user whose profile is to be fetched.
     * @returns {Promise<void>} - A promise that resolves when the user profile is fetched and the user address is set.
     * @throws {Error} - Throws an error if the user profile cannot be fetched.
     */
    const fetchUserProfile = async (email) => {
        try {
            console.log('Fetching profile for email:', email);

            const token = await AsyncStorage.getItem('token');

            const response = await axios.get(`http://192.168.2.16:3000/users/user/${email}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Log the response data for debugging
            console.log('Response data:', response.data);

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
            Alert.alert('Invalid Price', 'Please enter a valid positive number for the price.');
            return;
        }

        if (parsedPrice > 100000) {
            Alert.alert('Invalid Price', 'Price should not exceed $100,000.');
            return;
        }

        // Ensures that selectedIssue has necessary details
        if (!selectedIssue || !selectedIssue.userEmail || !selectedIssue.id) {
            Alert.alert('Error', 'Unable to retrieve complete issue details. Please try again.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'User token not found.');
                return;
            }
            console.log('Selected Issue:', selectedIssue);  // Log the whole issue object
            console.log('Issue ID:', selectedIssue?.id);    // Log the issue ID specifically
            console.log('Issue ID Type:', typeof selectedIssue?.id);

            if (!selectedIssue || !selectedIssue.userEmail) {
                console.log('clientEmail is null or undefined');
                Alert.alert('Error', 'Unable to retrieve client email from the selected issue.');
                return;
            }

            const issueTitle = selectedIssue.title; // Get the issue title
            const clientEmail = selectedIssue.userEmail; // Use userEmail from the schema
            const issueId = selectedIssue._id || selectedIssue.id;
            console.log('Resolved Issue ID:', issueId);

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

            console.log('Submitting Quote:', quoteData);  // Debugging info


            const response = await axios.post(
                `http://192.168.2.16:3000/quotes/create`,
                quoteData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                Alert.alert('Success', 'Quote submitted successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', 'Failed to submit the quote.');
            }
        } catch (error) {
            if (error.response?.status === 400) {
                Alert.alert('Error', 'You have already submitted a quote for this issue.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                console.error('Error submitting quote:', error);
                Alert.alert('Error', 'An error occurred while submitting the quote.');
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
        </KeyboardAvoidingView>
    );
}

