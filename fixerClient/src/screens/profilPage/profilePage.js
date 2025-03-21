import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../../style/profilePage/profilePageStyle';
import { IPAddress } from '../../../ipAddress';
import SettingsButton from "../../../components/settingsButton";

/**
 * @module fixerClient
 */

const ProfilePage = () => {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    //const [reviews, setReviews] = useState([]);


    useEffect(() => {
        /**
         * Fetches the profile data of the client.
         * 
         * This function retrieves the authentication token from AsyncStorage and uses it to make a GET request
         * to the profile endpoint. If the token is found, it sets the client data with the response. If no token
         * is found, it logs an error message. Any errors during the fetch process are caught and logged.
         * 
         * @async
         * @function fetchProfileData
         * @returns {Promise<void>} A promise that resolves when the profile data has been fetched and the client state has been set.
         */
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');

                if (token) {
                    const response = await axios.get(`http://192.168.1.143:3000/client/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setClient(response.data);
                } else {
                    console.error('No token found');
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    // const fetchReviews = async () => {
    //     try {
    //         const response = await axios.get(`http://${IPAddress}:3000/professional/${professional.email}/reviews`);
    //         setReviews(response.data);
    //         console.log(response.data);
    //         console.log(reviews.length)
    //     } catch (error) {
    //         console.log('Error fetching reviews:', error.response || error.message);
    //         //Alert.alert('Error', 'Failed to load reviews.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    // useEffect(() => {
    //     fetchReviews();
    // }, []);


    if (loading) return <Text>Loading...</Text>;
    if (!client) return <Text>Error loading profile.</Text>;

    // const renderStars = (rating) => {
    //     const roundedRating = Math.round(rating);
    //     return Array(roundedRating).fill('⭐').map((star, index) => (
    //         <Text key={index} style={styles.ratingText}>{star}</Text>
    //     ));
    // };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.globalFont}>
                <View style={styles.customHeader}>
                    <Text style={styles.headerLogo}>Fixr</Text>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <SettingsButton onPress={() => navigation.navigate('SettingsPage')} />
                </View>

                <View style={styles.profileContainer}>
                    <Image source={{ uri: client.idImageUrl || 'https://via.placeholder.com/50' }} style={styles.profileImage} />
                    <Text style={styles.nameText}>{client.firstName} {client.lastName}</Text>

                    {/*<View style={styles.ratingContainer}>*/}
                    {/*    {renderStars(professional.totalRating || 0)}*/}
                    {/*    <Text style={styles.reviewCountText}> ({professional.totalRating} )</Text>*/}
                    {/*</View>*/}
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {client.description || "No description provided."}
                    </Text>
                </View>

                {/*<View style={styles.reviewsContainer}>*/}
                {/*    <View style={{ flexDirection: 'row', alignItems: 'center' }}>*/}
                {/*        <Text style={styles.sectionTitle}>Rating & Reviews</Text>*/}
                {/*        <TouchableOpacity onPress={() => navigation.navigate('ReviewsPage', {professionalEmail: professional.email})}>*/}
                {/*            <Text style={styles.reviewCountLink}> ({reviews.length})</Text>*/}
                {/*        </TouchableOpacity>*/}
                {/*    </View>*/}

                {/*    {loading ? (*/}
                {/*        <ActivityIndicator size="large" color="#f28500" style={{ marginVertical: 10 }} />*/}
                {/*    ) : (*/}
                {/*        <ScrollView*/}
                {/*            horizontal={true}*/}
                {/*            showsHorizontalScrollIndicator={false}*/}
                {/*            contentContainerStyle={styles.reviewScrollContainer}*/}
                {/*        >*/}
                {/*            {reviews.length > 0 ? (*/}
                {/*                reviews.slice(0, 5).map((review, index) => (*/}
                {/*                    <View key={index} style={styles.reviewCard}>*/}
                {/*                        <View style={styles.reviewerHeader}>*/}
                {/*                            <Image source={{ uri: review.reviewerImage || 'https://via.placeholder.com/50' }} style={styles.reviewerImage} />*/}
                {/*                            <View>*/}
                {/*                                <Text style={styles.reviewerName}>{review.professionalNeeded}</Text>*/}
                {/*                                <Text style={styles.reviewerLocation}>{review.location || 'Unknown Location'}</Text>*/}
                {/*                            </View>*/}
                {/*                        </View>*/}

                {/*                        <Text style={styles.reviewText}>{review.comment || 'No comment provided.'}</Text>*/}

                {/*                        <View style={styles.reviewRatingContainer}>*/}
                {/*                            <View style={styles.starContainer}>*/}
                {/*                                {Array(Math.floor(review.rating)).fill('⭐').map((star, i) => (*/}
                {/*                                    <Text key={i} style={styles.ratingText}>{star}</Text>*/}
                {/*                                ))}*/}
                {/*                            </View>*/}
                {/*                            <Text style={styles.ratingNumber}>{review.rating.toFixed(1)}</Text>*/}
                {/*                            <Text style={styles.reviewDate}>{review.date}</Text>*/}
                {/*                        </View>*/}
                {/*                    </View>*/}
                {/*                ))*/}
                {/*            ) : (*/}
                {/*                <Text style={styles.noReviewsText}>No reviews available.</Text>*/}
                {/*            )}*/}
                {/*        </ScrollView>*/}
                {/*    )}*/}
                {/*</View>*/}


                <View style={styles.emailContainer}>
                    <Text style={styles.sectionTitle}>Email Address</Text>
                    <Text style={styles.emailText}>{client.email}</Text>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.inputBox}>
                        <Text>💳 Visa ending in 1234</Text>
                        <Text>Expiry 06/2024</Text>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Language</Text>
                    <View style={styles.inputBox}>
                        <Text>English</Text>
                    </View>
                </View>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Address</Text>
                    <View style={styles.inputBox}>
                        <Text>{client.street}, {client.provinceOrState}, {client.country}, {client.postalCode}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default ProfilePage;