import React, {useState, useEffect, useContext} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import {Picker} from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DropdownField from "../../../components/dropdownField";
import reportPageStyles from "../../../style/profilePage/reportPageStyle";
import {LanguageContext} from "../../../context/LanguageContext";
import {I18n} from "i18n-js";
import {en, fr} from "../../../localization";
import InputField from '../../../components/inputField';
import {IPAddress} from "../../../ipAddress";

const ReportPage = ({navigation}) => {
    // States for the form fields
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [professionalName, setProfessionalName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toLocaleDateString()); // Set today's date
    const [items, setItems] = useState(
        issues.map(issue => ({ label: issue.title, value: issue.title }))
    );
    const [open, setOpen] = useState(false);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;


    // Effect hook to set the default date to today's date
    useEffect(() => {
        const today = moment().format('YYYY-MM-DD');  // Formats the date as YYYY-MM-DD
        setDate(today);  // Set today's date
    }, []);

    useEffect(() => {
        if (issues.length > 0) {
            setItems(issues.map(issue => ({ label: issue.title, value: issue.title })));
        }
    }, [issues]);


    // Update professional's name when an issue is selected
    const handleIssueSelect = (selectedTitle) => {
        setSelectedIssue(selectedTitle); // Update the selected issue's title

        // Find the corresponding issue object based on the title
        const selectedIssueObj = issues.find(issue => issue.title === selectedTitle);

        if (selectedIssueObj) {
            // Update professional name based on the selected issue's professional email
            setProfessionalName(selectedIssueObj.professionalEmail || 'No professional assigned');
        } else {
            setProfessionalName('No professional assigned');
        }
    };



    const updateProfessionalName = (issue) => {
        setProfessionalName(issue?.professionalEmail || 'No professional assigned');
    };

    useEffect(() => {
        if (issues.length > 0) {
            updateProfessionalName(issues[0].professionalEmail || 'No professional assigned');
        }
    }, [issues]);



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

    useEffect(() => {
        if (selectedIssue) {
            handleIssueSelect(selectedIssue);
        }
    }, [selectedIssue]); // Runs whenever `selectedIssue` changes



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
                `https://fixercapstone-production.up.railway.app/send-email-report`,
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
    
    return (
        <ScrollView style={reportPageStyles.container}>


            <View style={reportPageStyles.headerContainer}>
                 <TouchableOpacity
                     style={reportPageStyles.backButton}
                     testID="back-button"
                     onPress={() => navigation.goBack()}
                 >
                     <Ionicons name="arrow-back" size={28} color='#ff8c00' />
                 </TouchableOpacity>

                 <Text style={reportPageStyles.headerTitle}>Report a Professional</Text>
             </View>

            {/* <Text style={reportPageStyles.label}>Report a Professional</Text> */}

            {/* Description field */}
            {/* <TextInput
                style={[reportPageStyles.input, reportPageStyles.descriptionInput]} // Custom style for description field
                placeholder="Describe the issue..."
                placeholderTextColor="#bbb"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"  // Ensures the text starts at the top
            /> */}

            <InputField
                placeholder="Describe the issue..."
                value={description}
                onChangeText={setDescription}
                multiline
            />   

            {/* Date field */}
            <View style={reportPageStyles.inputContainer}>
                <Text style={reportPageStyles.label}>Date of Report</Text>
                <TextInput
                    style={reportPageStyles.input}
                    value={date}
                    editable={false} // Make the date field read-only
                />
            </View>

            {/* Issue Dropdown */}
            <Text style={reportPageStyles.label}>Issue</Text>
            <View style={reportPageStyles.dropdownContainer}>
                <DropdownField
                    items={items}
                    value={selectedIssue}
                    setValue={setSelectedIssue}
                    placeholder="Select an issue"
                    open={open}
                    setOpen={setOpen}
                    setItems={setItems}
                    zIndex={100}
                />
            </View>

            {/* Professional Name Field (Auto-filled) */}
            <Text style={reportPageStyles.label}>Professional Name</Text>
            <TextInput
                style={reportPageStyles.input}
                value={professionalName}
                editable={false} // User can't edit it
            />

            {/* Submit Button */}
            <TouchableOpacity style={reportPageStyles.submitButton} onPress={handleSubmit}>
                <Text style={reportPageStyles.submitButtonText}>{i18n.t('submit')}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ReportPage;
