import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { styles } from '../style/homeScreenStyle';
import { IPAddress } from '../ipAddress';

export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const [issues, setIssues] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch all issues from the backend
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

    // Fetch issues when the component mounts
    React.useEffect(() => {
        fetchAllIssues();
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

    // Show loading indicator while data is being fetched
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
            {/* Display sections for Plumbing and Electrical Issues */}
            <View style={styles.workBlocksContainer}>
                <Text style={styles.sectionTitle}>Plumbing Issues</Text>
                <ScrollView contentContainerStyle={styles.workBlocks}>
                    {plumbingIssues.map((issue) => (
                        <TouchableOpacity
                            key={issue.id}
                            style={styles.card} // Updated styling for card look
                            onPress={() => handleIssueClick(issue)}
                        >
                            <Text style={styles.cardTitle}>{issue.title}</Text>
                            <Text style={styles.cardSubtitle}>Status: {issue.status}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Electrical Issues</Text>
                <ScrollView contentContainerStyle={styles.workBlocks}>
                    {electricalIssues.map((issue) => (
                        <TouchableOpacity
                            key={issue.id}
                            style={styles.card} // Updated styling for card look
                            onPress={() => handleIssueClick(issue)}
                        >
                            <Text style={styles.cardTitle}>{issue.title}</Text>
                            <Text style={styles.cardSubtitle}>Status: {issue.status}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.</Text>
            </View>
        </View>
    );
}
