import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { useCallback, useRef } from 'react';
import { styles } from '../../../style/profilePage/profilePageStyle';
import { IPAddress } from '../../../ipAddress';
import SettingsButton from "../../../components/settingsButton";
import {en, fr} from '../../../localization'
import { I18n } from "i18n-js";
import { LanguageContext } from "../../../context/LanguageContext";
import {Ionicons} from "@expo/vector-icons";
/**
 * @module fixerClient
 */

const ProfilePage = ({navigation, setIsLoggedIn}) => {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);
    const initialLoadComplete = useRef(false);
    const {locale, setLocale} = useContext(LanguageContext);
    const { changeLanguage } = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;
    //const [reviews, setReviews] = useState([]);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(locale); // default based on current locale
    const [items, setItems] = useState([
        { label: 'English', value: 'en' },
        { label: 'Français', value: 'fr' }
    ]);

    // Initial data load
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
            if (initialLoadComplete.current && client) {
                fetchProfileData(false);
            }
        }, [client])
    );

    // Function to fetch profile data
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

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/client/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (isMounted.current) {
                setClient(response.data);
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

    useEffect(() => {
        if (value !== locale) {
            changeLanguage(value); // persist + update
        }
    }, [value]);

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

    // Define new styles for the smaller, transparent text
    const smallTransparentText = {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.6)', // 60% opacity black
        marginTop: 3,
    };

    return (
        <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            <View style={styles.globalFont}>
                <View style={styles.customHeader}>
                    <Text style={styles.headerLogo}>Fixr</Text>
                    <Text style={styles.headerTitle}>{i18n.t('profile')}</Text>
                    <SettingsButton testID="settings-button" onPress={() => navigation.navigate('SettingsPage')} />
                </View>

                <View style={styles.profileContainer}>
                    <Image source={{ uri: client.idImageUrl || 'https://via.placeholder.com/50' }} style={styles.profileImage} />
                    <Text style={styles.nameText}>{client.firstName} {client.lastName}</Text>

                    {/* Added email and address directly under the name */}
                    <Text style={smallTransparentText}>{client.email}</Text>
                    {/*<View style={styles.ratingContainer}>*/}
                    {/*    {renderStars(professional.totalRating || 0)}*/}
                    {/*    <Text style={styles.reviewCountText}> ({professional.totalRating} )</Text>*/}
                    {/*</View>*/}
                </View>

                <View style={{ marginTop: 30, marginBottom: 5 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'left' }}>{i18n.t('street')}</Text>
                </View>
                <Text style={smallTransparentText}>{client.street}, {client.provinceOrState}, {client.country}, {client.postalCode}</Text>
                {/*<View style={styles.descriptionContainer}>*/}
                {/*    <Text style={styles.sectionTitle}>Description</Text>*/}
                {/*    <Text style={styles.descriptionText}>*/}
                {/*        {client.description || i18n.t('no_description_provided')}*/}
                {/*    </Text>*/}
                {/*</View>*/}

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

                {/*<View style={styles.sectionContainer}>*/}
                {/*    <Text style={styles.sectionTitle}>{i18n.t('language')}</Text>*/}
                {/*    <View>*/}
                {/*        <DropDownPicker*/}
                {/*            open={open}*/}
                {/*            value={value}*/}
                {/*            items={items}*/}
                {/*            setOpen={setOpen}*/}
                {/*            setValue={setValue}*/}
                {/*            setItems={setItems}*/}
                {/*            placeholder={locale === 'en' ? 'English' : 'Français'}*/}
                {/*            style={{*/}
                {/*                backgroundColor: '#E7E7E7',*/}
                {/*                borderColor: '#ddd',*/}
                {/*            }}*/}
                {/*            textStyle={{ fontSize: 13, fontWeight: 'bold' }}*/}
                {/*            dropDownContainerStyle={{*/}
                {/*                backgroundColor: '#E7E7E7',*/}
                {/*                borderColor: '#ddd',*/}
                {/*                zIndex: 1000*/}
                {/*            }}*/}
                {/*            listMode="SCROLLVIEW"*/}
                {/*            nestedScrollEnabled={true}*/}
                {/*        />*/}
                {/*    </View>*/}
                {/*</View>*/} 
            </View>
        </ScrollView>
        <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
  
            <TouchableOpacity style={styles.reportButton} activeOpacity={0.7} onPress={() => navigation.navigate('ReportPage')}>
                <Ionicons name="alert-circle-outline" size={22} color="white" />
                <Text style={styles.reportButtonText}>{i18n.t('report')}</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
};

export default ProfilePage;