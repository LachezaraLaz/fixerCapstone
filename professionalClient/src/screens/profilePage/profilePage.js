import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../../style/profilePage/profilePageStyle';
import { MaterialIcons } from '@expo/vector-icons';
import SettingsButton from "../../../components/settingsButton";
import { Platform } from 'react-native';

import { IPAddress } from '../../../ipAddress';

/**
 * @module professionalClient
 */

const ProfilePage = () => {
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bankingInfoAdded, setBankingInfoAdded] = useState(false); // New state for banking info status
    const [reviews, setReviews] = useState([]);
    const navigation = useNavigation();
    const [paymentMethod, setPaymentMethod] = useState(null);

    const isMounted = useRef(true);
    const initialLoadComplete = useRef(false);

    const smallTransparentText = {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.6)', // 60% opacity black
        marginTop: 3,
    };

    useEffect(() => {
        isMounted.current = true;
        if (!initialLoadComplete.current) {
            fetchProfileData(true);
        }

        return () => {
            isMounted.current = false;
        };
    }, []);

    // Silent refresh when coming back to the screen
    useFocusEffect(
        React.useCallback(() => {
            // Only do a silent refresh if we already loaded initial data
            if (initialLoadComplete.current && professional) {
                fetchProfileData(false);
            }
        }, [professional])
    );

    const fetchProfileData = async (isInitialLoad) => {
        if (!isMounted.current) return;

        // Only show loading indicator on initial load
        if (isInitialLoad) {
            setLoading(true);
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                if (isMounted.current && isInitialLoad) {
                    setLoading(false);
                }
                return;
            }

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (isMounted.current) {
                setProfessional(response.data);
                if (isInitialLoad) {
                    setLoading(false);
                    initialLoadComplete.current = true;
                }
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            if (isMounted.current && isInitialLoad) {
                setLoading(false);
            }
        }
    };

    /**
     * Fetches the reviews for the professional from the server.
     *
     * This function makes a GET request to the professional reviews endpoint to fetch the reviews
     * for the professional. If the request is successful, it sets the reviews state with the response
     * data. Any errors during the fetch process are caught and logged.
     *
     * @async
     * @function fetchReviews
     * @returns {Promise<void>} A promise that resolves when the reviews have been fetched and the state has been
     * updated.
     */
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/${professional.email}/reviews`);
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

    /**
     * Fetches the banking info status from the server.
     *
     * This function checks if the user has added their banking information.
     * If not, it prompts the user to add it.
     *
     * @async
     * @function fetchBankingInfoStatus
     * @returns {Promise<void>} A promise that resolves when the banking info status is fetched.
     */
    const fetchBankingInfoStatus = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token'); // Get the JWT token

            if (!userId || !token) {
                console.error("No userId or token found in AsyncStorage");
                return;
            }

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/banking-info-status`, {
                params: { userId },
                headers: { Authorization: `Bearer ${token}` },
            });

            setBankingInfoAdded(response.data.bankingInfoAdded);
        } catch (error) {
            console.error('Error fetching banking info status:', error.response?.data || error.message);
        }
    };

    const fetchPaymentMethod = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userId = await AsyncStorage.getItem('userId');

            if (!token || !userId) {
                console.error('Token or userId not found in AsyncStorage');
                return;
            }

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/payment-method`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { userId },
            });

            if (response.data) {
                setPaymentMethod(response.data);
            } else {
                console.error('No payment method data found in response');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('No payment method found for the user');
                setPaymentMethod(null); // Clear the payment method state
            } else {
                console.error('Error fetching payment method:', error);
            }
        }
    };

    useEffect(() => {
        fetchBankingInfoStatus();
        fetchPaymentMethod();
    }, []);

    if (loading) return <Text>Loading...</Text>;
    if (!professional) return <Text>Error loading profile.</Text>;

    const handleEditPress = () => {
        Alert.alert(
            "Feature Unavailable",
            "The editing feature is not available yet, but please keep an eye out for future updates!",
            [{ text: "OK", onPress: () => console.log("Alert closed") }]
        );
    };

    const handleVerifyCredentials = () => {
        navigation.navigate('CredentialFormPage');
    };

    /**
     * Renders a series of star emojis based on the given rating.
     *
     * @param {number} rating - The rating value to be converted into stars.
     * @returns {Array} An array of Text components containing star emojis.
     */
    const renderStars = (rating) => {
        const roundedRating = Math.round(rating);
        return Array(roundedRating).fill('⭐').map((star, index) => (
            <Text key={index} style={styles.ratingText}>{star}</Text>
        ));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            <View style={styles.globalFont}>
                <View style={styles.customHeader}>
                    <Text style={styles.headerLogo}>Fixr</Text>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <SettingsButton onPress={() => navigation.navigate('SettingsPage')} />
                </View>

                {/* Notice for banking information */}
                {!bankingInfoAdded && Platform.OS !== 'ios' && (
                    <View style={styles.noticeContainer}>
                        <Text style={styles.noticeText}>
                            ⚠️ To submit quotes, please add your banking information.
                        </Text>
                        <TouchableOpacity
                            style={styles.addBankingButton}
                            onPress={() => navigation.navigate('BankingInfoPage')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.addBankingButtonText}>➕ Add Banking</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.profileContainer}>
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: professional.idImageUrl || 'https://via.placeholder.com/50' }} style={styles.profileImage} />
                        <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
                            <MaterialIcons name="edit" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.nameText}>{professional.firstName} {professional.lastName}</Text>
                    <Text style={smallTransparentText}>{professional.email}</Text>

                    <View style={styles.ratingContainer}>
                        {renderStars(professional.totalRating || 0)}
                        <Text style={styles.reviewCountText}> ({professional.totalRating})</Text>
                    </View>
                </View>


                {/*<View style={styles.descriptionContainer}>*/}
                {/*    <Text style={styles.sectionTitle}>Description</Text>*/}
                {/*    <Text style={styles.descriptionText}>*/}
                {/*        {professional.description || "No description provided."}*/}
                {/*    </Text>*/}
                {/*</View>*/}

                <View style={styles.reviewsContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>Rating & Reviews</Text>
                        <TouchableOpacity 
                        // onPress={() => navigation.navigate('ReviewsPage', {professionalEmail: professional.email})} 
                        >
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

                {/*<View style={styles.emailContainer}>*/}
                {/*    <Text style={styles.sectionTitle}>Email Address</Text>*/}
                {/*    <Text style={styles.emailText}>{professional.email}</Text>*/}
                {/*</View>*/}

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.inputBox}>
                        {paymentMethod ? (
                            <>
                                <Text>
                                    💳 {paymentMethod.cardBrand} ending in {paymentMethod.cardLast4}
                                </Text>
                                <Text>Expiry {paymentMethod.expiryDate}</Text>
                            </>
                        ) : (
                            <Text>No payment method added.</Text>
                        )}
                    </View>
                </View>

                {/*<View style={styles.sectionContainer}>*/}
                {/*    <Text style={styles.sectionTitle}>Language</Text>*/}
                {/*    <View style={styles.inputBox}>*/}
                {/*        <Text>English</Text>*/}
                {/*    </View>*/}
                {/*</View>*/}

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