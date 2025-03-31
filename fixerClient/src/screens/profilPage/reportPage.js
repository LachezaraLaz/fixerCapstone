import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import {Picker} from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const reportPage = ({navigation}) => {
    // States for the form fields
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [professionalName, setProfessionalName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toLocaleDateString()); // Set today's date

    const handleSubmit = async () => {
        if (!description || !date || !professionalName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const formData = {
            description,
            date,
            issue: selectedIssue,
            professionalName,
        };

        try {
            const token = await AsyncStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email;

            const response = await axios.post(
                'https://fixercapstone-production.up.railway.app/send-email-report',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                Alert.alert('Success', 'Your report has been submitted',
                    [
                        {
                            text: "Go to Profile",
                            onPress: () => {
                                navigation.goBack();
                            }
                        },
                    ],
                    { cancelable: false }
                    );
            } else {
                console.error('Error sending email:', error.response);
                Alert.alert('Error', 'Could not send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            Alert.alert('Error', 'Could not send email');
        }
    };

    // Effect hook to set the default date to today's date
    useEffect(() => {
        const today = moment().format('YYYY-MM-DD');  // Formats the date as YYYY-MM-DD
        setDate(today);  // Set today's date
    }, []);

    useEffect(() => {
        if (issues.length > 0) {
            setSelectedIssue(issues[0]._id); // Set default issue selection
            updateProfessionalName(issues[0]);  // Automatically set the professional name of the first issue
        }
    }, [issues]);

    const updateProfessionalName = (issue) => {
        if (issue && issue.professionalEmail) {
            setProfessionalName(issue.professionalEmail);  // Set the professional's email if available
        } else {
            setProfessionalName('No professional assigned');
        }
    };


    // Fetch issues when the page loads
    useEffect(() => {
        const fetchJobs = async () => {
            const token = await AsyncStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email;

            try {
                const response = await axios.get(`https://fixercapstone-production.up.railway.app/issue/user/${userEmail}`);
                setIssues(response.data.jobs); // Set the jobs state to the fetched data
            } catch (error) {
                console.error('Error fetching jobs:', error);
                Alert.alert('Error', 'Could not fetch jobs');
            }
        };

        fetchJobs();
    }, []);


    // Update professional's name when an issue is selected
    const handleIssueSelect = (issueId) => {
        setSelectedIssue(issueId);

        // Find the selected issue object
        const selectedIssueObj = issues.find(issue => issue._id === issueId);

        if (selectedIssueObj) {
            // Update the professional name using the selected issue object
            updateProfessionalName(selectedIssueObj);
        } else {
            setProfessionalName('No professional assigned');
        }
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Report a Professional</Text>

            {/* Description field */}
            <TextInput
                style={[styles.input, styles.descriptionInput]} // Custom style for description field
                placeholder="Describe the issue..."
                placeholderTextColor="#bbb"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"  // Ensures the text starts at the top
            />

            {/* Date field */}
            <View style={styles.inputContainer}>
                <Text style={styles.labelDropdown}>Date</Text>
                <TextInput
                    style={styles.input}
                    value={date}
                    editable={false} // Make the date field read-only
                />
            </View>

            {/* Issue Dropdown */}
            <Text style={styles.label}>Issue</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedIssue}
                    onValueChange={handleIssueSelect} // Call the function directly
                    style={styles.picker}
                >
                    {issues.map((issue, index) => (
                        <Picker.Item key={index} label={issue.title} value={issue._id} />
                    ))}
                </Picker>
            </View>

            {/* Professional Name Field (Auto-filled) */}
            <Text style={styles.label}>Professional Name</Text>
            <TextInput
                style={styles.input}
                value={professionalName}
                editable={false} // User can't edit it
            />

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F8F8',
    },
    labelDropdown: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#555',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555',
        marginBottom: 5,
    },
    input: {
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    descriptionInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    inputContainer: {
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 15,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    pickerContainer: {
            marginBottom: 25, // Add more space below picker
            backgroundColor: '#FFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#DDD',
            overflow: 'hidden',
            padding: 10,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
    picker: {
        height: 55,
        width: '100%',
        backgroundColor: '#FFF', // Ensuring white background
        borderRadius: 8,
        paddingHorizontal: 10,
    },
});


export default reportPage;
