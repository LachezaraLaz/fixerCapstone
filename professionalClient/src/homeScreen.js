import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { styles } from '../style/homeScreenStyle';
import { IPAddress } from '../ipAddress';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const [issues, setIssues] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentLocation, setCurrentLocation] = React.useState(null);
    const scrollY = React.useRef(new Animated.Value(0)).current;

    const fetchAllIssues = async () => {
        try {
            const response = await axios.get(`http://${IPAddress}:3000/issues`);
            setIssues(response.data.jobs);
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

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            Alert.alert('Logged out', 'You have been logged out successfully');
            setIsLoggedIn(false);
            navigation.replace('welcomePage');
        } catch (error) {
            console.error("Error logging out: ", error);
            Alert.alert('Error', 'An error occurred while logging out');
        }
    };

    const handleIssueClick = (issue) => {
        Alert.alert(issue.title, issue.description);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const plumbingIssues = issues.filter(issue => issue.professionalNeeded === 'plumber');
    const electricalIssues = issues.filter(issue => issue.professionalNeeded === 'electrician');


    const mapHeight = scrollY.interpolate({
        inputRange: [0, 500], // Interval of scrolling
        outputRange: [400, 150], // Height of map from 400 to 150
        extrapolate: 'clamp' // dont let surpass limit
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }]}>
                <TouchableOpacity onPress={() => navigation.navigate('ProfilePage')}>
                    <Ionicons name="person-circle" size={32} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('NotificationPage')}>
                    <Ionicons name="notifications-outline" size={28} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Scrollable Map */}
            <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],  // Mise à jour du scrollY
                    { useNativeDriver: false } // Désactivation du native driver pour éviter des erreurs
                )}
                scrollEventThrottle={16}  // Améliore la réactivité du défilement
            >
                {/* Section map */}
                <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
                    <MapView
                        style={styles.map}
                        showsUserLocation={true}
                        followsUserLocation={true}
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
                        {issues.map((issue) => (
                            <Marker
                                key={issue.id}
                                coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
                                title={issue.title}
                                description={issue.description}
                                onPress={() => handleIssueClick(issue)}
                            />
                        ))}
                    </MapView>
                </Animated.View>

                {/* Plumbing Issues Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Plumbing Issues</Text>
                    {plumbingIssues.map((issue) => (
                        <TouchableOpacity
                            key={issue.id}
                            style={styles.card}
                            onPress={() => handleIssueClick(issue)}
                        >
                            <Text style={styles.cardTitle}>{issue.title}</Text>
                            <Text style={styles.cardSubtitle}>Status: {issue.status}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Electrical Issues Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Electrical Issues</Text>
                    {electricalIssues.map((issue) => (
                        <TouchableOpacity
                            key={issue.id}
                            style={styles.card}
                            onPress={() => handleIssueClick(issue)}
                        >
                            <Text style={styles.cardTitle}>{issue.title}</Text>
                            <Text style={styles.cardSubtitle}>Status: {issue.status}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer - Stays above the navbar */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.</Text>
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}
