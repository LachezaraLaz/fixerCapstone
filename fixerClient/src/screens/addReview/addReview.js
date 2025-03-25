import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import {IPAddress} from "../../../ipAddress";
import { styles } from '../../../style/addReview/addReviewStyle';
import OrangeButton from "../../../components/orangeButton";
import {Ionicons} from "@expo/vector-icons";
import NotificationButton from "../../../components/notificationButton";

/**
 * @module fixerClient
 */

const AddReview = ({ navigation, route }) => {
    const { jobId } = route.params; // Get the jobId from navigation parameters

    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');

    /**
     * Handles the submission of a review.
     * 
     * This function validates the rating and comment inputs, sends the review data to the backend,
     * and provides feedback to the user based on the success or failure of the submission.
     * 
     * @async
     * @function handleSubmit
     * @returns {Promise<void>}
     * 
     * @throws Will alert an error message if the rating or comment is missing, if the rating is not a number between 1 and 5,
     *         or if there is an error during the submission process.
     */
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
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/reviews/add`, {
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
        <View>
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add a Review</Text>
                <NotificationButton onPress={() => navigation.navigate("NotificationPage")}/>
            </View>
            <View style={styles.container}>

            </View>
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

            <OrangeButton
                title={'Submit Review'}
                onPress={handleSubmit}
            />
        </View>
    );
};

export default AddReview;