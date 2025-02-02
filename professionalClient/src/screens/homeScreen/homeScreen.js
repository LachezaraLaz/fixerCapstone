import * as React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Animated, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { styles } from '../../../style/homescreen/homeScreenStyle';
import { IPAddress } from '../../../ipAddress';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatContext } from '../chat/chatContext';

// Utility function to calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371; // Radius of the Earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

export default function HomeScreen({ navigation, route, setIsLoggedIn }) {
    const [issues, setIssues] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentLocation, setCurrentLocation] = React.useState(null);
    const [selectedFilters, setSelectedFilters] = React.useState([]);
    const [typesOfWork, setTypesOfWork] = React.useState([]);
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { chatClient } = useChatContext();
    //const [searchQuery, setSearchQuery] = React.useState('');  // New state for search query
    const mapRef = React.useRef(null);
    const scrollViewRef = React.useRef(null);

    const fetchAllIssues = async () => {
        try {
            const response = await axios.get(`https://fixercapstone-production.up.railway.app/issues`);
            setIssues(response.data.jobs);

            const uniqueTypes = [
                ...new Set(response.data.jobs.map((issue) => issue.professionalNeeded)),
            ];
            setTypesOfWork(uniqueTypes);
        } catch (error) {
            console.error('Error fetching issues:', error);
            Alert.alert('Error', 'An error occurred while fetching issues.');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Could not get your current location.');
        }
    };

    React.useEffect(() => {
        fetchAllIssues();
        getCurrentLocation();
    }, []);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (route.params?.selectedFilters || route.params?.distanceRange) {
                setSelectedFilters(route.params.selectedFilters || []);
            }
        });
        return unsubscribe;
    }, [navigation, route.params?.selectedFilters, route.params?.distanceRange]);

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

    const filteredIssues = React.useMemo(() => {
        return issues.filter((issue) => {
            // Filter by professionalNeeded
            const matchesProfessional = selectedFilters.length === 0 || selectedFilters.includes(issue.professionalNeeded);

            // Filter by distance
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

            // Filter by search query
            /*const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.description.toLowerCase().includes(searchQuery.toLowerCase());*/

            return matchesProfessional && matchesDistance/* && matchesSearch*/;
        });
    }, [issues, selectedFilters, currentLocation, route.params?.distanceRange/*, searchQuery*/]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const mapHeight = scrollY.interpolate({
        inputRange: [0, 500],
        outputRange: [450, 150],
        extrapolate: 'clamp',
    });

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

    const handleRecenterMap = () => {
        if (mapRef.current && currentLocation) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
            }, 500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ paddingBottom: 100 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        showsUserLocation={true}
                        shouldRasterizeIOS={true} // Optimize for iOS
                        renderToHardwareTextureAndroid={true} // Optimize for Android
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
                        <View style={styles.profileButton}>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfilePage')}>
                                <Ionicons name="person-circle" size={32} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.notificationButton}>
                            <TouchableOpacity onPress={() => navigation.navigate('NotificationPage')}>
                                <Ionicons name="notifications-outline" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.recenterButtonContainer}>
                            <TouchableOpacity style={styles.recenterButton} onPress={handleRecenterMap}>
                                <Ionicons name="locate" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        {filteredIssues.map((issue) => (
                            <Marker
                                key={issue._id}
                                testID={`marker-${issue._id}`}
                                coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
                                title={issue.title}
                                description={issue.description}
                            />
                        ))}
                    </MapView>
                </Animated.View>

                <View style={styles.searchContainer}>
                    {/*
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    */}
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => navigation.navigate('FilterIssue', {
                            typesOfWork,
                            selectedFilters,
                            distanceRange: route.params?.distanceRange || [0, 50], // Pass current distance range or default
                        })}
                    >
                        <Ionicons name="filter" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Issues</Text>
                    {filteredIssues.map((issue) => (
                        <TouchableOpacity
                            key={issue._id}
                            style={styles.card}
                            onPress={() => handleIssueClick(issue)}
                        >
                            <Text style={styles.cardTitle}>{issue.title}</Text>
                            <Text style={styles.cardSubtitle}>Status: {issue.status}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}