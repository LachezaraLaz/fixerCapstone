import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationButton from "../../../components/notificationButton";
import SearchBar from "../../../components/searchBar";
import OrangeButton from "../../../components/orangeButton";
import { useChatContext } from '../chat/chatContext';
import styles from '../../../style/homeScreenStyle';
import HeroImage from '../homeScreen/HomePageIMG/HomePage_IMG1.png';
import {LanguageContext} from "../../../context/LanguageContext";
import {I18n} from "i18n-js";
import {en, fr} from "../../../localization";

/**
 * @module fixerClient
 */
export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const { chatClient } = useChatContext();
    const [firstName, setFirstName] = useState('');
    const [miniOffers, setMiniOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    useEffect(() => {
        navigation.setOptions({ headerShown: false });

        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) return;

                const response = await axios.get(`https://fixercapstone-production.up.railway.app/client/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.firstName) {
                    setFirstName(response.data.firstName);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const loadOffers = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) return;

                // fetch client email
                const profile = await axios.get(
                    `https://fixercapstone-production.up.railway.app/client/profile`,
                    //`http://192.168.0.19:3000/client/profile`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                const email = profile.data.email;

                // fetch all offers for client
                const resp = await axios.get(
                    `https://fixercapstone-production.up.railway.app/client/${email}`,
                    //`http://192.168.0.19:3000/quotes/client/${email}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                //console.log('API Response:', resp.data);

                setMiniOffers(Array.isArray(resp.data) ? resp.data : []);
            } catch (e) {
                console.error('Error loading mini-offers:', e);
            } finally {
                setLoadingOffers(false);
            }
        };
        loadOffers();
    }, []);

    /**
     * Handles the user logout process.
     */
    const handleLogout = async () => {
        try {
            if (chatClient) {
                await chatClient.disconnectUser();
            }
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('streamToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userName');

            Alert.alert(`${i18n.t('logged_out')}`, `${i18n.t('you_have_been_logged_out_successfully')}`);
            setIsLoggedIn(false);
        } catch (error) {
            console.error("Error logging out: ", error);
            Alert.alert(`${i18n.t('error')}`, `${i18n.t('an_error_occurred_while_logging_out')}`);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.customHeader}>
                    <Text style={styles.headerLogo}>Fixr</Text>
                    <Text style={styles.headerTitle}>{i18n.t('home_screen')}</Text>
                    <NotificationButton
                        testID="notification-button"
                        onPress={() => navigation.navigate('NotificationPage')}
                    />
                </View>

                {/* Hero/Greeting */}
                <View style={styles.heroContainer}>
                    {/* Hero Image that overlaps the top */}
                    <Image source={HeroImage} style={styles.heroImage} />

                    {/* Text Section */}
                    <View style={styles.heroTextContainer}>
                        <Text style={styles.heroTitle}>{i18n.t('hi')} {firstName}!</Text>
                        <Text style={styles.heroSubtitle}>{i18n.t('need_something')}</Text>
                        <Text style={styles.heroSubtitle}>{i18n.t('fixed')}</Text>
                    </View>
                </View>

                {/* SearchBar */}
                <View style={styles.searchBarWrapper}>
                    <SearchBar
                        testID="search-button"
                        onSearch={() => console.log("Search button pressed")}
                        onFilter={() => console.log("Filter button pressed")}
                        filterButtonTestID="filter-button"
                    />
                </View>

                {/* Create New Job Button */}
                <View style={styles.createJobContainer}>
                    <View style={styles.createJobButton}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreateIssue')}
                            style={styles.createJobButtonInner}
                        >
                            <Text style={styles.createJobButtonText}>{i18n.t('create_issue')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Categories Section */}
                <View style={styles.categoriesHeader}>
                    <Text style={styles.categoriesTitle}>{i18n.t('categories')}</Text>
                    <TouchableOpacity onPress={() => console.log('View All Categories')}>
                        <Text style={styles.viewAllText}>{i18n.t('view_all')}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                    {/* Category: Plumbing */}
                    <View style={styles.categoryItem}>
                        <Image
                            source={require('../homeScreen/CategoriesIMGs/Plumber_IMG.png')}
                            style={styles.categoryImage}
                        />
                        <Text style={styles.categoryName}>{i18n.t('plumbing')}</Text>
                    </View>

                    {/* Category: Cleaning */}
                    <View style={styles.categoryItem}>
                        <Image
                            source={require('../homeScreen/CategoriesIMGs/Cleaner_IMG.png')}
                            style={styles.categoryImage}
                        />
                        <Text style={styles.categoryName}>{i18n.t('cleaning')}</Text>
                    </View>

                    {/* Category: Electrical */}
                    <View style={styles.categoryItem}>
                        <Image
                            source={require('../homeScreen/CategoriesIMGs/Electrician_IMG.png')}
                            style={styles.categoryImage}
                        />
                        <Text style={styles.categoryName}>{i18n.t('electrical')}</Text>
                    </View>
                </ScrollView>

                {/* Requests Section */}
                <View style={styles.requestsHeader}>
                    <Text style={styles.requestsTitle}>{i18n.t('requests')}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('OffersPage')}>
                        <Text style={styles.viewAllText}>{i18n.t('view_all')}</Text>
                    </TouchableOpacity>
                </View>

                {loadingOffers ? (
                    <ActivityIndicator style={{ marginTop: 20 }} />
                ) : (
                    <View style={{ height: 330 }}>
                        <ScrollView style={styles.requestsContainer}>
                            {miniOffers.length ? miniOffers.map((offer) => {
                                // If the pro has no reviews, we'll show grey star & "0" rating
                                const hasReviews = offer.professionalReviewCount > 0;
                                const starColor = hasReviews ? "#FFA500" : "grey";
                                const starRatingText = hasReviews
                                    ? `${parseFloat(offer.professionalTotalRating).toFixed(1)}`
                                    : "0";


                                return (
                                    <View key={offer._id} style={styles.requestCard}>
                                        <Image
                                            source={{ uri: 'https://via.placeholder.com/60' }}
                                            style={styles.requestUserImage}
                                        />

                                        <View style={styles.requestContent}>
                                            {/* Name + Star Rating */}
                                            <View style={styles.requestTopRow}>
                                                <Text style={styles.requestUserName}>
                                                    {
                                                        // If professionalFirstName/LastName not found, fallback to email
                                                        (offer.professionalFirstName || offer.professionalLastName)
                                                            ? `${offer.professionalFirstName} ${offer.professionalLastName}`
                                                            : offer.professionalEmail
                                                    }
                                                </Text>
                                                <View style={styles.requestRating}>
                                                    <Ionicons name="star" size={16} color={starColor} />
                                                    <Text style={[styles.ratingText, { color: starColor }]}>
                                                        {starRatingText}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Price row */}
                                            <View style={styles.requestAddressRow}>
                                                <Ionicons name="cash-outline" size={16} color="#FFA500" style={{ marginRight: 4 }} />
                                                <Text style={styles.requestAddress}>Price: ${offer.price}</Text>
                                            </View>

                                            {/* Date row */}
                                            <View style={styles.dateRow}>
                                                <Ionicons name="calendar-outline" size={16} color="#FFA500" style={{ marginRight: 4 }} />
                                                <Text style={styles.date}>
                                                    {new Date(offer.createdAt).toLocaleDateString()}
                                                </Text>
                                            </View>

                                            {/* Status */}
                                            <Text style={styles.requestJob}>
                                                Status: {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                                            </Text>

                                            {/* Accept/Reject if pending */}
                                            {offer.status === 'pending' && (
                                                <View style={styles.requestButtonsRow}>
                                                    <TouchableOpacity style={styles.rejectButton}>
                                                        <Text style={styles.rejectText}>{i18n.t('reject')}</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.acceptButton}>
                                                        <Text style={styles.acceptText}>{i18n.t('accept')}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            }) : (
                                <Text style={styles.emptyText}>{i18n.t('no_requests_available')}</Text>
                            )}
                        </ScrollView>
                    </View>
                )}
                {/* Logout Button at Bottom */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>{i18n.t('logout')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
