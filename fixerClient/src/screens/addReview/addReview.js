import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import {IPAddress} from "../../../ipAddress";

const AddReview = ({ navigation, route }) => {
    const { jobId } = route.params; // Get the jobId from navigation parameters

    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        if (!rating || !comment) {
            Alert.alert('Error', 'Please provide both a rating and a comment.');
            return;
        }
        const numericRating = parseInt(rating, 10);

        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            Alert.alert('Error', 'Rating must be a number between 1 and 5.');
            return;
        }

        try {
            // Send the review data to the backend
            const response = await axios.post(`http://${IPAddress}:3000/reviews/add`, {
                jobId,
                rating: parseInt(rating, 10),
                comment,
            });

            // Handle success response
            Alert.alert('Success', 'Your review has been submitted!');
            navigation.goBack(); // Navigate back to the previous screen
        } catch (error) {
            // Handle error response
            console.error('Error submitting review:', error.response || error.message);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Something went wrong. Please try again.'
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add a Review</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter a rating (1-5)"
                keyboardType="numeric"
                value={rating}
                onChangeText={setRating}
            />

            <TextInput
                style={styles.textArea}
                placeholder="Write your comment..."
                value={comment}
                onChangeText={setComment}
                multiline
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit Review</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddReview;