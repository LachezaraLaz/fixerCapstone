import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { IPAddress } from '../../../ipAddress';

const ReviewsPage = ({ route }) => {
    const { professionalEmail } = route.params; // Get professional email from navigation parameters
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/${professionalEmail}/reviews`);
                setReviews(response.data);
            } catch (error) {
                console.log('Error fetching reviews:', error.response || error.message);
                //Alert.alert('Error', 'Failed to load reviews.');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [professionalEmail]);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (reviews.length === 0) {
        return (
            <View style={styles.container}>
                <Text>No reviews available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={reviews}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.reviewCard}>
                        <Text style={styles.jobTitle}>Title: {item.professionalNeeded}</Text>
                        <Text style={styles.jobTitle}>Description: {item.description}</Text>
                        <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                        <Text style={styles.commentText}>{item.comment}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    reviewCard: {
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    ratingText: {
        fontSize: 16,
        color: '#FFD700',
        marginTop: 5,
    },
    commentText: {
        fontSize: 16,
        marginTop: 5,
    },
});

export default ReviewsPage;