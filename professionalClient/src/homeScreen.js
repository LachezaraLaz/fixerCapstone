import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { styles } from '../style/homeScreenStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const [issues, setIssues] = React.useState([]);     //State to hold fetched issues
    const [loading, setLoading] = React.useState(true);

    // Fetch all issues from the backend
    const fetchAllIssues = async () => {
        try {
            const response = await axios.get('http://192.168.2.16:3000/issues');
            setIssues(response.data.jobs);
        } catch (error) {
            console.error('Error fetching issues:', error);
            Alert.alert('Error', 'An error occurred while fetching issues.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch issues when the component mounts
    React.useEffect(() => {
        fetchAllIssues();
    }, []);




    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            Alert.alert('Logged out', 'You have been logged out successfully');

            setIsLoggedIn(false); // Update login state
            navigation.replace('welcomePage'); // Navigate to welcome page
        } catch (error) {
            console.error("Error logging out: ", error);
            Alert.alert('Error', 'An error occurred while logging out');
        }
    };

    const handleIssueClick = (issue) => {
        Alert.alert(issue.title, issue.description);
    };

    // Show loading indicator while data is being fetched
    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

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

            {/* List of issues */}
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
                <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.</Text>
            </View>
        </View>
    );
}
