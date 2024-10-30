import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { styles } from '../style/homeScreenStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded issues with location data
const issues = [
    {
        id: 1,
        title: 'Leaky Faucet',
        description: 'Client has a leaky faucet in the kitchen.',
        latitude: 37.78825,
        longitude: -122.4324,
    },
    {
        id: 2,
        title: 'Electrical Problem',
        description: 'Client reported frequent power outages.',
        latitude: 37.78925,
        longitude: -122.4314,
    },
    {
        id: 3,
        title: 'Clogged Drain',
        description: 'Bathroom sink is clogged and not draining.',
        latitude: 37.79025,
        longitude: -122.4304,
    },
];

export default function HomeScreen({ navigation, setIsLoggedIn }) {
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

    return (
        <View style={styles.container}>
            {/* Map with issue markers */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
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

            {/* List of hardcoded issues */}
            <View style={styles.workBlocksContainer}>
                <ScrollView contentContainerStyle={styles.workBlocks}>
                    {issues.map((issue) => (
                        <TouchableOpacity
                            key={issue.id}
                            style={styles.workBlock}
                            onPress={() => handleIssueClick(issue)}
                        >
                            <Text style={styles.workText}>{issue.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.
                </Text>
            </View>
        </View>
    );
}
