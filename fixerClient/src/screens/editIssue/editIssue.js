import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPAddress } from '../../../ipAddress';

export default function EditIssue({ route, navigation }) {
    const { jobId } = route.params; // Get jobId from route parameters

    // Define state for the job fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch the issue details to populate the form fields
    const fetchJobDetails = async () => {
        console.log('Starting fetchJobDetails function'); // Start of function

        try {
            const token = await AsyncStorage.getItem('token');
            console.log('Token retrieved from AsyncStorage:', token); // Log token

            // Ensure the token exists and jobId is valid before making the request
            if (!token) {
                Alert.alert('You are not logged in');
                navigation.goBack(); // Redirect user if not logged in
                return;
            }

            if (!jobId) {
                Alert.alert('Invalid job ID');
                navigation.goBack();
                return;
            }

            // Log the full URL and jobId to verify it's correct
            const fullUrl = `http://${IPAddress}:3000/issue/${jobId}`;
            console.log('Full URL being requested:', fullUrl);
            console.log('Job ID:', jobId); // Log jobId to confirm it is correct

            // Make the axios request
            const response = await axios.get(fullUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Log the status of the response
            console.log('Response status:', response.status);

            // Check if the response is OK (status 200-299)
            if (response.status === 200) {
                const { title, description, professionalNeeded } = response.data;
                console.log('Data received from server:', response.data); // Log data received

                setTitle(title);
                setDescription(description);
                setProfessionalNeeded(professionalNeeded);
                console.log('Data set in state successfully'); // Confirm state update
            } else {
                console.log('Failed to fetch job details with status:', response.status); // Log failure status
                Alert.alert('Failed to load job details');
            }
        } catch (error) {
            if (error.response) {
                // The server responded with a status other than 2xx
                console.error('Server responded with an error:', error.response.data);
                Alert.alert(`Error: ${error.response.data.message || 'Failed to load job details'}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                Alert.alert('No response from server. Please try again later.');
            } else {
                // Other errors
                console.error('Error in fetchJobDetails function:', error.message);
                Alert.alert('An error occurred while loading job details');
            }
        } finally {
            setLoading(false); // Stop loading indicator
            console.log('Loading set to false'); // Confirm loading indicator stopped
        }
    };

    useEffect(() => {
        fetchJobDetails();
    }, []);

    // Function to handle updating the issue
    const updateJob = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            // Ensure the token exists before making the update request
            if (!token) {
                Alert.alert('You are not logged in');
                return;
            }

            const response = await axios.put(`http://${IPAddress}:3000/issue/${jobId}`, {
                title,
                description,
                professionalNeeded,
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200) {
                Alert.alert('Job updated successfully');
                navigation.goBack(); // Navigate back to MyIssuesPosted
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
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Edit Job</Text>
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
                multiline
            />
            <TextInput
                placeholder="Professional Needed"
                value={professionalNeeded}
                onChangeText={setProfessionalNeeded}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <Button title="Save Changes" onPress={updateJob} />
        </View>
    );
}
