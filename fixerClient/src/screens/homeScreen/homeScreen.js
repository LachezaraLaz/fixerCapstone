import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationButton from "../../../components/notificationButton";
import SearchBar from "../../../components/searchBar";
import OrangeButton from "../../../components/orangeButton";
import { useChatContext } from '../chat/chatContext';
import styles from '../../../style/homeScreenStyle';
import HeroImage from '../homeScreen/HomePageIMG/HomePage_IMG1.png';

/**
 * @module fixerClient
 */
export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const { chatClient } = useChatContext();
    const [firstName, setFirstName] = useState('');

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

            Alert.alert('Logged out', 'You have been logged out successfully');
            setIsLoggedIn(false);
        } catch (error) {
            console.error("Error logging out: ", error);
            Alert.alert('Error', 'An error occurred while logging out');
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
                <Text style={styles.headerTitle}>Home Screen</Text>
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
                    <Text style={styles.heroTitle}>Hi {firstName}!</Text>
                    <Text style={styles.heroSubtitle}>Need Something</Text>
                    <Text style={styles.heroSubtitle}>Fixed?</Text>
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
                        <Text style={styles.createJobButtonText}>Create New Job</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Categories Section */}
            <View style={styles.categoriesHeader}>
                <Text style={styles.categoriesTitle}>Categories</Text>
                <TouchableOpacity onPress={() => console.log('View All Categories')}>
                    <Text style={styles.viewAllText}>View All</Text>
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
                    <Text style={styles.categoryName}>Plumbing</Text>
                </View>

                {/* Category: Cleaning */}
                <View style={styles.categoryItem}>
                    <Image
                        source={require('../homeScreen/CategoriesIMGs/Cleaner_IMG.png')}
                        style={styles.categoryImage}
                    />
                    <Text style={styles.categoryName}>Cleaning</Text>
                </View>

                {/* Category: Electrical */}
                <View style={styles.categoryItem}>
                    <Image
                        source={require('../homeScreen/CategoriesIMGs/Electrician_IMG.png')}
                        style={styles.categoryImage}
                    />
                    <Text style={styles.categoryName}>Electrical</Text>
                </View>
            </ScrollView>

            {/* Requests Section */}
            <View style={styles.requestsHeader}>
                <Text style={styles.requestsTitle}>Requests</Text>
                <TouchableOpacity onPress={() => console.log('View All Requests')}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.requestsContainer}>
                {/* Request Card #1 */}
                <View style={styles.requestCard}>
                    {/* Profile Image on the Left */}
                    <Image
                        source={{ uri: 'https://via.placeholder.com/60' }}
                        style={styles.requestUserImage}
                    />

                    {/* Right-side content: Name, Rating, Address, Job, Accept/Reject Buttons */}
                    <View style={styles.requestContent}>
                        {/* Top Row: Name + Star Rating */}
                        <View style={styles.requestTopRow}>
                            <Text style={styles.requestUserName}>Shawn Obrain</Text>
                            <View style={styles.requestRating}>
                                <Ionicons name="star" size={16} color="#FFA500" />
                                <Text style={styles.ratingText}>4.8</Text>
                            </View>
                        </View>

                        {/* Address Row with Location Icon */}
                        <View style={styles.requestAddressRow}>
                            <Ionicons name="location-outline" size={16} color="#FFA500" style={{ marginRight: 4 }} />
                            <Text style={styles.requestAddress}>4517 Washington Ave</Text>
                        </View>

                        {/* Job Title */}
                        <Text style={styles.requestJob}>AC Installation</Text>

                        {/* Reject & Accept Buttons */}
                        <View style={styles.requestButtonsRow}>
                            <TouchableOpacity style={styles.rejectButton}>
                                <Text style={styles.rejectText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.acceptButton}>
                                <Text style={styles.acceptText}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Request Card #2 */}
                <View style={styles.requestCard}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/60' }}
                        style={styles.requestUserImage}
                    />
                    <View style={styles.requestContent}>
                        <View style={styles.requestTopRow}>
                            <Text style={styles.requestUserName}>Shawn Obrain</Text>
                            <View style={styles.requestRating}>
                                <Ionicons name="star" size={16} color="#FFA500" />
                                <Text style={styles.ratingText}>4.8</Text>
                            </View>
                        </View>
                        <View style={styles.requestAddressRow}>
                            <Ionicons name="location-outline" size={16} color="#FFA500" style={{ marginRight: 4 }} />
                            <Text style={styles.requestAddress}>4517 Washington Ave</Text>
                        </View>
                        <Text style={styles.requestJob}>AC Installation</Text>
                        <View style={styles.requestButtonsRow}>
                            <TouchableOpacity style={styles.rejectButton}>
                                <Text style={styles.rejectText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.acceptButton}>
                                <Text style={styles.acceptText}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
            {/* Logout Button at Bottom */}
            <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
                <View style={{ height: 40 }} />
        </ScrollView>
        </SafeAreaView>
    );
}