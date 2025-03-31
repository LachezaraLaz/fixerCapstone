import * as React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator, 
    SafeAreaView, 
    Animated, 
    Linking, 
    Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';
import Carousel from 'react-native-snap-carousel-v4';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { AppState, Platform } from 'react-native';

import { useChatContext } from '../chat/chatContext';
import IssueDetailScreen from '../issueDetailScreen/issueDetailScreen';
import CustomAlertLocation from '../../../components/customAlertLocation';
import NotificationButton from '../../../components/notificationButton';
import { styles } from '../../../style/homescreen/homeScreenStyle';



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
    const { selectedFilters = [], distanceRange, rating, timeline } = route.params || {};
    const [typesOfWork, setTypesOfWork] = React.useState([]);
    const [bankingInfoAdded, setBankingInfoAdded] = React.useState(false); // New state for banking info status
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { chatClient } = useChatContext();
    const mapRef = React.useRef(null);
    const scrollViewRef = React.useRef(null);
    const navigation = useNavigation();
    const [locationPermission, setLocationPermission] = React.useState(null);
    const [selectedMarker, setSelectedMarker] = React.useState(null);
    const modalTranslateY = React.useRef(new Animated.Value(500)).current; // Start off screen (500 px under screen)
    const [errorAlertVisible, setErrorAlertVisible] = React.useState(false);
    const [errorAlertContent, setErrorAlertContent] = React.useState({ title: '', message: '' });

    const [showCarousel, setShowCarousel] = React.useState(true);
    const [selectedIssue, setSelectedIssue] = React.useState(null);
    const [carouselIndex, setCarouselIndex] = React.useState(0);

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


    /**
     * Requests foreground location permissions from the user and updates the permission state.
     *
     * @async
     * @function checkLocationPermission
     * @returns {Promise<string>} - The status of the location permission (e.g., 'granted', 'denied').
     */
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


    /**
     * useEffect hook that runs on component mount and when navigation changes.
     *
     * - Fetches all issues and banking information status.
     * - Retrieves the user's current location.
     * - Adds listeners to update location when the screen is focused or when the app returns to the foreground.
     * - Cleans up listeners on component unmount.
     *
     * @function useEffect
     */
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
            // Alert.alert('Logged out', 'You have been logged out successfully');
            setIsLoggedIn(false);
        } catch (error) {
            console.error("Error logging out: ", error);
            Alert.alert('Error', 'An error occurred while logging out');
        }
    };


    /**
     * Filters issues based on selected work types, distance range, minimum rating, and timeline.
     *
     * - Checks if the issue's professional type matches any selected filters.
     * - Calculates the distance from the user's current location and filters based on range.
     * - Filters by minimum rating and exact timeline match if specified.
     *
     * @constant {Array} filteredIssues - The array of issues that match all active filters.
     */
    const filteredIssues = issues.filter(issue => {
        const typeOfWork = issue.professionalNeeded || ''; // Get the professional types
    
        // Match if ANY selected filter appears in the professionalNeeded string
        const matchesType =
            selectedFilters.length === 0 ||
            selectedFilters.some(filter => {
                const typesArray = typeOfWork.split(',').map(t => t.trim().toLowerCase());
                return typesArray.includes(filter.toLowerCase());
            });
    
        // Distance filter
        let matchesDistance = true;
        if (currentLocation && distanceRange && distanceRange.length === 2) {
            const [minDistance, maxDistance] = distanceRange;
            const distance = calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                issue.latitude,
                issue.longitude
            );
            matchesDistance = distance >= minDistance && distance <= maxDistance;
        }
    
        // Rating filter
        const matchesRating = !rating || issue.rating >= rating;
    
        // Timeline filter
        const matchesTimeline = !timeline || issue.timeline === timeline;
    
        return matchesType && matchesDistance && matchesRating && matchesTimeline;
    });


    /**
     * Renders an individual item in the map carousel.
     *
     * - On press, sets the selected issue, animates the modal up, and centers the map on the item's location.
     * - Displays issue title, type of professional needed, and timeline priority with appropriate styling and icons.
     *
     * @function renderItem
     * @param {Object} item - The issue item to render.
     * @returns {JSX.Element} - A styled TouchableOpacity component representing the issue.
     */
    const renderItem = ({ item }) => (
        <TouchableOpacity
          onPress={() => {
            setSelectedIssue(item);
            
            modalTranslateY.setValue(500); // Start from bottom
            
            // Animate map to center on this item
            mapRef.current?.animateToRegion({
              latitude: item.latitude,
              longitude: item.longitude,
              latitudeDelta: 0.0122,
              longitudeDelta: 0.0121,
            }, 500);
      
            // Animate modal up (but carousel still visible until modalTranslateY === 0)
            Animated.spring(modalTranslateY, {
              toValue: 0,
              friction: 8,
              tension: 50,
              useNativeDriver: true,
            }).start();
          }}
        >
          <View style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
            width: 260,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Ionicons name="hammer-outline" size={14} style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 14 }}>{item.professionalNeeded}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Ionicons name="alarm-outline" size={14} style={{ marginRight: 4 }} />
                <Text
                    style={{
                    fontSize: 14,
                    color: item.timeline === 'high-priority' ? 'red' : item.timeline ? 'orange' : 'grey'
                    }}
                >
                    {item.timeline ? formatTimeline(item.timeline) : 'N/A'}
                </Text>
            </View>

          </View>
        </TouchableOpacity>
    );
      

    /**
     * Displays a loading indicator while data is being fetched or processed.
     *
     * - Renders a centered ActivityIndicator when `loading` is true.
     *
     * @condition
     * @returns {JSX.Element|null} - A loading spinner inside a styled container, or null if not loading.
     */
    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator testID="loading-indicator" size="large" color="#0000ff" />
            </View>
        );
    }

    /**
     * Interpolates the height of the map view based on scroll position.
     *
     * - Shrinks the map height from 350 to 150 as the user scrolls from 0 to 500.
     * - Clamps the output to prevent values outside the specified range.
     *
     * @constant {Animated.AnimatedInterpolation} mapHeight - The animated height value for the map.
     */
    const mapHeight = scrollY.interpolate({
        inputRange: [0, 500],
        outputRange: [350, 150],
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
     * Handles the event when a map marker is pressed.
     *
     * - Rounds coordinates to group markers at the same location.
     * - Finds and sets all jobs at the selected location.
     * - Sets the selected issue, shows the carousel, and animates the modal and map.
     *
     * @function handleMarkerPress
     * @param {Object} selected - The issue associated with the pressed marker.
     */
    const roundCoord = (coord) => Math.round(coord * 10000) / 10000;

    const handleMarkerPress = (selected) => {
        const lat = roundCoord(selected.latitude);
        const lng = roundCoord(selected.longitude);
        const key = `${lat},${lng}`;

        const jobsAtSameLocation = groupedIssues.find(group => {
            const first = group[0];
            return roundCoord(first.latitude) === lat && roundCoord(first.longitude) === lng;
        });

        setSelectedMarker(jobsAtSameLocation || []);
        setSelectedIssue(selected);
        setShowCarousel(true);

        modalTranslateY.setValue(500);
        Animated.spring(modalTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
        }).start();
    
        mapRef.current?.animateToRegion({
            latitude: selected.latitude,
            longitude: selected.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
        }, 500);
    };


    /**
     * Groups jobs by proximity of their coordinates to handle overlapping map markers.
     *
     * - Compares latitude and longitude differences within a small threshold.
     * - Jobs within the threshold are grouped together in the same array.
     *
     * @function groupJobsByLocation
     * @param {Array} issues - The list of issues to group by location.
     * @returns {Array[]} - An array of grouped issue arrays based on location proximity.
     */
    const groupJobsByLocation = (issues) => {
        const groups = [];
    
        for (let issue of issues) {
            const matchGroup = groups.find(group => {
                const latDiff = Math.abs(group[0].latitude - issue.latitude);
                const lngDiff = Math.abs(group[0].longitude - issue.longitude);
                return latDiff < 0.00005 && lngDiff < 0.00005; // adjust threshold as needed
            });
    
            if (matchGroup) {
                matchGroup.push(issue);
            } else {
                groups.push([issue]);
            }
        }
    
        return groups;
    };
    
    const groupedIssues = groupJobsByLocation(filteredIssues);


    /**
     * Formats a timeline string by capitalizing the first letter of each word segment.
     *
     * - Converts strings like "high-priority" to "High-Priority".
     *
     * @function formatTimeline
     * @param {string} timeline - The timeline string to format.
     * @returns {string|null} - The formatted timeline string or null if input is falsy.
     */
    const formatTimeline = (timeline) => {
        if (!timeline) return null;
        return timeline
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('-');
    };
      
    
    /**
     * Handles the closing animation of the issue detail modal.
     *
     * - Animates the modal sliding down off-screen.
     * - Resets the selected marker and hides the carousel after animation completes.
     *
     * @function handleCloseIssueDetail
     */
    const handleCloseIssueDetail = () => {
        Animated.timing(modalTranslateY, {
            toValue: 500,  // go down (Out of screen)
            duration: 250, // short time of closing (faster)
            useNativeDriver: true,
        }).start(() => {
            setSelectedMarker(null); // close modal when animation is finished
            setShowCarousel(false);
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.customHeader}>
                <Text style={styles.headerLogo}>Fixr</Text>
                <Text style={styles.headerTitle}>Home</Text>
                <NotificationButton
                    testID="notification-button"
                    onPress={() => navigation.navigate('NotificationPage')}
                />
            </View>

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
                        {groupedIssues.map((group, index) => {
                            const firstIssue = group[0]; // Use first for lat/lng and popup

                            return (
                                <Marker
                                    key={`marker-${index}`}
                                    coordinate={{latitude: firstIssue.latitude, longitude: firstIssue.longitude}}
                                    onPress={() => handleMarkerPress(firstIssue)}
                                >
                                    <View style={{
                                        backgroundColor: '#f28500',
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        borderRadius: 20,
                                        borderWidth: 2,
                                        borderColor: '#fff',
                                        shadowColor: '#000',
                                        shadowOffset: {width: 0, height: 2},
                                        shadowOpacity: 0.3,
                                        shadowRadius: 3,
                                        elevation: 5,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>

                                        {group.length > 0 && (
                                            <Text style={{
                                                color: '#fff',
                                                fontWeight: 'bold'
                                            }}>{group.length}</Text>
                                        )}
                                    </View>
                                </Marker>
                            );
                        })}

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
                                        <Text
                                        style={[
                                            styles.issueReviews,
                                            { color: issue.timeline === 'high-priority' ? 'red' : issue.timeline ? 'orange' : 'grey' }
                                        ]}
                                        >
                                        {issue.timeline ? formatTimeline(issue.timeline) : 'N/A'}
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
                        zIndex: 1000,
                    }}>
                    <IssueDetailScreen
                        key={selectedIssue?.id}
                        issue={selectedIssue}
                        issues={selectedMarker}
                        onClose={handleCloseIssueDetail}
                    />
                </Animated.View>
            )}
            {selectedMarker && showCarousel && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 320,
                        left: 0,
                        right: 0,
                        alignItems: 'center',
                        zIndex: 998,
                        elevation: 10,
                    }}
                >
                    <Carousel
                        data={selectedMarker}
                        renderItem={renderItem}
                        sliderWidth={Dimensions.get('window').width}
                        itemWidth={280}
                        layout={'default'}
                        inactiveSlideScale={0.95}
                        inactiveSlideOpacity={0.8}
                        loop={false}
                        enableSnap={true}
                        onSnapToItem={(index) => {
                            setCarouselIndex(index);
                            setSelectedIssue(selectedMarker[index]); // make sure modal updates too
                        }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
                        {selectedMarker.map((_, index) => (
                            <View
                            key={`dot-${index}`}
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                marginHorizontal: 4,
                                backgroundColor: index === carouselIndex ? '#f28500' : '#ccc',
                            }}
                            />
                        ))}
                    </View>
                </View>
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