import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../../style/profilePage/profilePageStyle';
import { IPAddress } from '../../../ipAddress';
import SettingsButton from "../../../components/settingsButton";

const ProfilePage = () => {
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [reviews, setReviews] = useState([]);


    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');

                if (token) {
                    const response = await axios.get(`http://${IPAddress}:3000/professional/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setProfessional(response.data);
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

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://${IPAddress}:3000/professional/${professional.email}/reviews`);
            setReviews(response.data);
            console.log(response.data);
            console.log(reviews.length)
        } catch (error) {
            console.log('Error fetching reviews:', error.response || error.message);
            //Alert.alert('Error', 'Failed to load reviews.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchReviews();
    }, []);


    if (loading) return <Text>Loading...</Text>;
    if (!professional) return <Text>Error loading profile.</Text>;

    const handleEditPress = () => {
        alert("Editing is not available yet. Stay tuned for updates!");
    };

    const handleVerifyCredentials = () => {
        navigation.navigate('CredentialFormPage');
    };

    const renderStars = (rating) => {
        const roundedRating = Math.round(rating);
        return Array(roundedRating).fill('⭐').map((star, index) => (
            <Text key={index} style={styles.ratingText}>{star}</Text>
        ));
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.globalFont}>
                <View style={styles.customHeader}>
                    <Text style={styles.headerLogo}>Fixr</Text>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <SettingsButton onPress={() => navigation.navigate('SettingsPage')} />
                </View>

                <View style={styles.profileContainer}>
                    <Image source={{ uri: professional.idImageUrl || 'https://via.placeholder.com/50' }} style={styles.profileImage} />
                    <Text style={styles.nameText}>{professional.firstName} {professional.lastName}</Text>

                    <View style={styles.ratingContainer}>
                        {renderStars(professional.totalRating || 0)}
                        <Text style={styles.reviewCountText}> ({professional.totalRating} )</Text>
                    </View>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {professional.description || "No description provided."}
                    </Text>
                </View>

                <View style={styles.reviewsContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>Rating & Reviews</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ReviewsPage', {professionalEmail: professional.email})}>
                            <Text style={styles.reviewCountLink}> ({reviews.length})</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#f28500" style={{ marginVertical: 10 }} />
                    ) : (
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.reviewScrollContainer}
                        >
                            {reviews.length > 0 ? (
                                reviews.slice(0, 5).map((review, index) => (
                                    <View key={index} style={styles.reviewCard}>
                                        <View style={styles.reviewerHeader}>
                                            <Image source={{ uri: review.reviewerImage || 'https://via.placeholder.com/50' }} style={styles.reviewerImage} />
                                            <View>
                                                <Text style={styles.reviewerName}>{review.professionalNeeded}</Text>
                                                <Text style={styles.reviewerLocation}>{review.location || 'Unknown Location'}</Text>
                                            </View>
                                        </View>

                                        <Text style={styles.reviewText}>{review.comment || 'No comment provided.'}</Text>

                                        <View style={styles.reviewRatingContainer}>
                                            <View style={styles.starContainer}>
                                                {Array(Math.floor(review.rating)).fill('⭐').map((star, i) => (
                                                    <Text key={i} style={styles.ratingText}>{star}</Text>
                                                ))}
                                            </View>
                                            <Text style={styles.ratingNumber}>{review.rating.toFixed(1)}</Text>
                                            <Text style={styles.reviewDate}>{review.date}</Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noReviewsText}>No reviews available.</Text>
                            )}
                        </ScrollView>
                    )}
                </View>



                <View style={styles.emailContainer}>
                    <Text style={styles.sectionTitle}>Email Address</Text>
                    <Text style={styles.emailText}>{professional.email}</Text>
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

                <View style={styles.certificatesContainer}>
                    <Text style={styles.sectionTitle}>Certificates</Text>

                    {professional.certificates && professional.certificates.length > 0 ? (
                        professional.certificates.map((certificate, index) => (
                            <View key={index} style={styles.certificateItem}>
                                <View>
                                    <Text style={styles.certificateTitle}>{certificate.name}</Text>
                                    <Text style={styles.certificateSubText}>{certificate.field}</Text>
                                </View>
                                <Text style={styles.issuedDate}>Issued Date: {certificate.issuedDate}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noCertificatesText}>No certificates available.</Text>
                    )}
                </View>


                {!professional.formComplete ? (
                    <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCredentials}>
                        <Text style={styles.verifyButtonText}>Verify Credentials</Text>
                    </TouchableOpacity>
                ) : professional.approved ? (
                    <Text style={styles.verifiedText}>Credentials Verified!</Text>
                ) : (
                    <Text style={styles.waitingText}>Credential Verification: Pending...</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default ProfilePage;