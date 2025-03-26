import * as React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Animated, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { styles } from '../../../style/homescreen/homeScreenStyle';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatContext } from '../chat/chatContext';
import { useNavigation } from '@react-navigation/native';
import { AppState } from 'react-native';
import { Platform } from 'react-native';
import IssueDetailScreen from '../issueDetailScreen/issueDetailScreen';
import CustomAlertLocation from '../../../components/customAlertLocation';


/**
 * @module professionalClient
 */

/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of the first point in degrees.
 * @param {number} lon1 - Longitude of the first point in degrees.
 * @param {number} lat2 - Latitude of the second point in degrees.
 * @param {number} lon2 - Longitude of the second point in degrees.
 * @returns {number} - The distance between the two points in kilometers.
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371; // Earth radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export default function HomeScreen({ route, setIsLoggedIn }) {
    const [issues, setIssues] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentLocation, setCurrentLocation] = React.useState(null);
    const [selectedFilters, setSelectedFilters] = React.useState([]);
    const [typesOfWork, setTypesOfWork] = React.useState([]);
    const [rating, setRating] = React.useState(route.params?.rating || 0);
    const [timeline, setTimeline] = React.useState(route.params?.timeline || '');
    const [bankingInfoAdded, setBankingInfoAdded] = React.useState(false); // New state for banking info status
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { chatClient } = useChatContext();
    const mapRef = React.useRef(null);
    const scrollViewRef = React.useRef(null);
    const navigation = useNavigation();
    const [locationPermission, setLocationPermission] = React.useState(null);
    // const [selectedIssue, setSelectedIssue] = React.useState(null);
    const [selectedMarker, setSelectedMarker] = React.useState(null);
    const modalTranslateY = React.useRef(new Animated.Value(500)).current; // Start off screen (500 px under screen)
    const [errorAlertVisible, setErrorAlertVisible] = React.useState(false);
    const [errorAlertContent, setErrorAlertContent] = React.useState({ title: '', message: '' });

    /**
     * Fetches all issues from the server and updates the state with the fetched data.
     *
     * This function makes an asynchronous GET request to the specified endpoint to retrieve
     * a list of issues. Upon successful retrieval, it updates the state with the list of issues
     * and extracts unique types of work required by the issues. If an error occurs during the
     * fetch operation, it logs the error and displays an alert to the user.
     *
     * @async
     * @function fetchAllIssues
     * @returns {Promise<void>} A promise that resolves when the fetch operation is complete.
     */
    const fetchAllIssues = async () => {
        try {
            const response = await axios.get(`https://fixercapstone-production.up.railway.app/issues`);
            const fixedIssues = response.data.jobs
                .map(issue => ({
                    ...issue,
                    latitude: issue.latitude ? parseFloat(issue.latitude) : null,
                    longitude: issue.longitude ? parseFloat(issue.longitude) : null,
                }))
                .filter(issue => issue.latitude !== null && issue.longitude !== null); // Remove invalid locations
            setIssues(fixedIssues);
            const uniqueTypes = [...new Set(fixedIssues.map(issue => issue.professionalNeeded))];
            setTypesOfWork(uniqueTypes);
        } catch (error) {
            console.error('Error fetching issues:', error);
            Alert.alert('Error', 'An error occurred while fetching issues.');
        } finally {
            setLoading(false);
        }
    };

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
            const token = await AsyncStorage.getItem('token'); // Retrieve the token

            if (!userId || !token) {
                console.error("No userId or token found in AsyncStorage");
                return;
            }

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/banking-info-status`, {
                params: { userId },
                headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
            });

            setBankingInfoAdded(response.data.bankingInfoAdded);
        } catch (error) {
            console.error('Error fetching banking info status:', error.response?.data || error.message);
        }
    };

    const checkLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        return status;
    };

    /**
     * Asynchronously gets the current location of the user.
     *
     * This function checks for location permissions and requests them if not already granted.
     * If permissions are granted, it retrieves the current position and updates the state with the latitude and longitude.
     * If permissions are denied, it prompts the user to enable location services in the settings.
     *
     * @async
     * @function getCurrentLocation
     * @returns {Promise<void>} A promise that resolves when the location is retrieved or permission status is handled.
     */
    const getCurrentLocation = async () => {
        const status = await checkLocationPermission();
        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            if (location && location.coords) {
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0122,
                    longitudeDelta: 0.0121,
                });
            }
        } else {
            setCurrentLocation({
                latitude: 45.5017, // Montreal Default Location
                longitude: -73.5673,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
            });
        }
    };

    React.useEffect(() => {
        fetchAllIssues();
        getCurrentLocation();
        fetchBankingInfoStatus(); // Fetch banking info status on component mount
        const focusListener = navigation.addListener('focus', getCurrentLocation);
        const appStateListener = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                getCurrentLocation(); // Recheck permissions and location when app returns to foreground
            }
        });
        return () => {
            focusListener();
            appStateListener.remove();
        };
    }, [navigation]);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setSelectedFilters(route.params?.selectedFilters || []);
            setRating(route.params?.rating || 0);
            setTimeline(route.params?.timeline || '');
        });
        return unsubscribe;
    }, [navigation, route.params]);


    /**
     * Handles the user logout process.
     *
     * This function performs the following steps:
     * 1. Disconnects the user from the chat client if it exists.
     * 2. Removes the user's token, stream token, user ID, and user name from AsyncStorage.
     * 3. Displays an alert indicating the user has been logged out successfully.
     * 4. Sets the `isLoggedIn` state to false.
     *
     * If an error occurs during the logout process, it logs the error to the console
     * and displays an alert indicating that an error occurred.
     *
     * @async
     * @function handleLogout
     * @returns {Promise<void>} A promise that resolves when the logout process is complete.
     */
    const handleLogout = async () => {
        try {
            if (chatClient) await chatClient.disconnectUser();
            await AsyncStorage.multiRemove(['token', 'streamToken', 'userId', 'userName']);
            Alert.alert('Logged out', 'You have been logged out successfully');
            setIsLoggedIn(false);
        } catch (error) {
            console.error("Error logging out: ", error);
            Alert.alert('Error', 'An error occurred while logging out');
        }
    };

    /**
     * Filters and returns a list of unique issues based on selected filters and distance range.
     *
     * @function
     * @name filteredIssues
     * @returns {Array} - The filtered list of unique issues.
     *
     * @example
     * // Example usage:
     * const issues = [
     *   { _id: '1', professionalNeeded: 'plumber', latitude: 40.7128, longitude: -74.0060 },
     *   { _id: '2', professionalNeeded: 'electrician', latitude: 34.0522, longitude: -118.2437 }
     * ];
     * const selectedFilters = ['plumber'];
     * const currentLocation = { latitude: 37.7749, longitude: -122.4194 };
     * const route = { params: { distanceRange: [0, 100] } };
     * const result = filteredIssues(issues, selectedFilters, currentLocation, route.params.distanceRange);
     * console.log(result);
     *
     * @param {Array} issues - The list of issues to filter.
     * @param {Array} selectedFilters - The list of selected filters for professionals needed.
     * @param {Object} currentLocation - The current location with latitude and longitude.
     * @param {Array} route.params.distanceRange - The distance range [minDistance, maxDistance] to filter issues by.
     */
    const filteredIssues = React.useMemo(() => {
        return issues.filter(issue => {
            const matchesProfessional = selectedFilters.length === 0 || selectedFilters.includes(issue.professionalNeeded);
            let matchesDistance = true;
            if (currentLocation && route.params?.distanceRange) {
                const [minDistance, maxDistance] = route.params.distanceRange;
                const distance = calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    issue.latitude,
                    issue.longitude
                );
                matchesDistance = distance >= minDistance && distance <= maxDistance;
            }
            const matchesRating = route.params?.rating ? issue.rating === route.params.rating : true; // filter value of star
            const matchesUrgency = route.params?.timeline ? issue.timeline === route.params.timeline : true; // filter value of timeline

            return matchesProfessional && matchesDistance && matchesRating && matchesUrgency;
        });
    }, [issues, selectedFilters, currentLocation, route.params?.distanceRange, route.params?.rating, route.params?.timeline]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator testID="loading-indicator" size="large" color="#0000ff" />
            </View>
        );
    }

    const mapHeight = scrollY.interpolate({
        inputRange: [0, 500],
        outputRange: [450, 150],
        extrapolate: 'clamp',
    });

    /**
     * Handles the click event on an issue.
     * Scrolls the scroll view to the top and animates the map to the issue's location.
     *
     * @param {Object} issue - The issue object containing location details.
     * @param {number} issue.latitude - The latitude of the issue's location.
     * @param {number} issue.longitude - The longitude of the issue's location.
     */
    const handleIssueClick = (issue) => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }

        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: issue.latitude,
                longitude: issue.longitude,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
            }, 500);
        }
    };

    /**
     * Re-centers the map to the current location with a smooth animation.
     *
     * @function handleRecenterMap
     * @returns {void}
     */
    const handleRecenterMap = () => {
        if (locationPermission !== 'granted') {
            setErrorAlertContent({
                title: 'Location Permission Denied',
                message: 'To use this feature, enable location services in settings.'
            });
            setErrorAlertVisible(true);
            return;
        }
        if (mapRef.current && currentLocation) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
            }, 500);
        }
    };

    /**
     * Handles marker click: Opens bottom sheet with issue details.
     */
    const handleMarkerPress = (issue) => {
        setSelectedMarker(issue);

        modalTranslateY.setValue(500);
        Animated.spring(modalTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
        }).start();

        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: issue.latitude,
                longitude: issue.longitude,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
            }, 500);
        }
    };

    const handleCloseIssueDetail = () => {
        Animated.timing(modalTranslateY, {
            toValue: 500,  // go down (Out of screen)
            duration: 250, // short time of closing (faster)
            useNativeDriver: true,
        }).start(() => {
            setSelectedMarker(null); // close modal when animation is finished
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Notice for banking information */}
            {!bankingInfoAdded && Platform.OS !== 'ios' && (
                <View style={styles.noticeContainer}>
                    <Ionicons name="alert-circle-outline" size={24} color="#d84315" style={styles.noticeIcon} />
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

            <Animated.ScrollView ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 100 }} scrollEventThrottle={16}>
                {/* Map Section */}
                <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        shouldRasterizeIOS={true}
                        renderToHardwareTextureAndroid={true}
                        region={currentLocation ? {
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                            latitudeDelta: 0.0122,
                            longitudeDelta: 0.0121,
                        } : {
                            latitude: 37.78825,
                            longitude: -122.4324,
                            latitudeDelta: 0.0122,
                            longitudeDelta: 0.0121,
                        }}
                    >
                        {filteredIssues.map((issue, index) => (
                            <Marker
                                key={issue._id || `marker-${index}`}
                                coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
                                onPress={() => handleMarkerPress(issue)}
                            />
                        ))}
                    </MapView>
                    {/* Recenter Button */}
                    <View style={styles.recenterButtonWrapper}>
                        <TouchableOpacity
                            testID="recenterButton"
                            style={[
                                styles.recenterButton,
                                locationPermission !== 'granted' && styles.recenterButtonDenied,
                            ]}
                            onPress={handleRecenterMap}
                        >
                            <Ionicons name="locate" size={30} color="#333" />
                            {locationPermission !== 'granted' && <View style={styles.deniedSlash} />}
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Filter Button */}
                <View style={styles.searchContainer}>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => navigation.navigate('FilterIssue', {
                            typesOfWork,
                            selectedFilters,
                            distanceRange: route.params?.distanceRange || [0, 50], // Pass current distance range or default
                            rating,
                            timeline,
                        })}
                    >
                        <Ionicons name="filter" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Issues List */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Issues</Text>
                    {filteredIssues.map((issue, index) => (
                        <TouchableOpacity
                            key={issue._id || `issue-${index}`}
                            style={styles.issueCard}
                            onPress={() => handleIssueClick(issue)}
                        >
                            <View style={styles.issueDetails}>
                                <Text style={styles.issueTitle}>{issue.title}</Text>
                                <Text style={styles.issueDescription}>{issue.description}</Text>
                                <View style={styles.issueRatingContainer}>
                                    <Ionicons
                                        name="star"
                                        size={16}
                                        color={issue.rating ? "#f1c40f" : "#ccc"} // Grey if rating is null/0
                                    />
                                    <Text style={[styles.issueRating, { color: issue.rating ? '#f1c40f' : '#ccc' }]}>
                                        {issue.rating || 'No rating'}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.issueReviews}>|</Text>
                                        <Text style={[styles.issueReviews, { color: issue.timeline === 'high-priority' ? 'red' : 'orange' }]}>
                                            {issue.timeline}
                                        </Text>
                                    </View>

                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>
            {selectedMarker && (
                <Animated.View
                    pointerEvents="box-none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        transform: [{ translateY: modalTranslateY }],
                    }}>
                    <IssueDetailScreen
                        issue={selectedMarker}
                        onClose={handleCloseIssueDetail}
                    />
                </Animated.View>
            )}
            <CustomAlertLocation
                visible={errorAlertVisible}
                title={errorAlertContent.title}
                message={errorAlertContent.message}
                confirmText="Go to Settings"
                cancelText="Back"
                onConfirm={() => {
                    setErrorAlertVisible(false);
                    Linking.openSettings();
                }}
                onClose={() => setErrorAlertVisible(false)}
            />

        </SafeAreaView>
    );
}