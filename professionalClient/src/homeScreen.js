import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { styles } from '../style/homeScreenStyle';
import { IPAddress } from '../ipAddress';
import * as Location from 'expo-location';

export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const [issues, setIssues] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentLocation, setCurrentLocation] = React.useState(null);

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

    return (
        <View style={styles.container}>
            {/* Scrollable content */}
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Map Section */}
                <View style={styles.mapContainer}>
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
                </View>

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
            </ScrollView>

            {/* Footer - Stays above the navbar */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.</Text>
            </View>
        </View>
    );
}

