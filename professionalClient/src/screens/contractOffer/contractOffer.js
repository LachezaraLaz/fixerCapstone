import React, { useState } from 'react';
import {View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Image, StyleSheet} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { styles } from '../../../style/contractOffer/contractOfferStyle';

export default function ContractOffer({ route, navigation }) {
    const { issue } = route.params;
    const [price, setPrice] = React.useState('');
    const [selectedIssue, setSelectedIssue] = React.useState(null);
    const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

    React.useEffect(() => {
        if (issue) {
            setSelectedIssue(issue);
        }
    }, [issue]);

    const submitQuote = async () => {
        if (!price) {
            Alert.alert('Error', 'Please enter a price before submitting the quote.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'User token not found.');
                return;
            }
            console.log('selectedIssue:', selectedIssue);

            if (!selectedIssue || !selectedIssue.userEmail) {
                console.log('clientEmail is null or undefined');
                Alert.alert('Error', 'Unable to retrieve client email from the selected issue.');
                return;
            }

            const clientEmail = selectedIssue.userEmail; // Use userEmail from the schema
            const issueId = selectedIssue._id;

            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/quotes/create`,
                { clientEmail, price, issueId },
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
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{issue.title}</Text>
            <Text style={styles.subtitle}>Detailed Information</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{issue.description}</Text>

                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{issue.status}</Text>

                <Text style={styles.label}>Professional Needed:</Text>
                <Text style={styles.value}>{issue.professionalNeeded}</Text>

                {issue.address && (
                    <>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.value}>{issue.address}</Text>
                    </>
                )}

                <Text style={styles.label}>Coordinates:</Text>
                <Text style={styles.value}>
                    Latitude: {issue.latitude}, Longitude: {issue.longitude}
                </Text>
            </View>

            {/* Additional Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Job Requirements</Text>
                <Text style={styles.sectionContent}>
                    {issue.requirements || 'No specific requirements provided for this job.'}
                </Text>
            </View>

            {/* Placeholder for Images/Documents */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Related Images/Documents</Text>
                {issue.imageUrl ? (
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={[styles.sectionContent, { color: 'blue', textDecorationLine: 'underline' }]}>
                            Image 1
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.sectionContent}>No attachments provided for this issue.</Text>
                )}
            </View>

            {/* Modal for Image */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={modalStyles.modalContainer}>
                    <Image
                        source={{ uri: issue.imageUrl }}
                        style={modalStyles.image}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={modalStyles.closeButton}
                    >
                        <Text style={modalStyles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fee</Text>
                <TextInput
                    placeholder="Enter price for this issue"
                    value={price}
                    keyboardType="numeric"
                    onChangeText={setPrice}
                    style={styles.input}
                />
            </View>

            {/* Go Back Button */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={submitQuote} style={styles.submitButton}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}


const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '90%',
        height: '70%',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'black',
        fontWeight: 'bold',
    },
});


