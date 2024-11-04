import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    return (
        <ScrollView style={styles.container}>
            {/* Map Section */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            </View>

            {/* Work Blocks Section */}
            <View style={styles.workBlocksContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.workBlocks}>
                    <TouchableOpacity style={styles.workBlock} onPress={() => navigation.navigate('ProfilePage')}>
                        <Text style={styles.workText}>Profile Page</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.workBlock} onPress={() => navigation.navigate('DetailsScreen')}>
                        <Text style={styles.workText}>Detail Screen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.workBlock} onPress={() => navigation.navigate('CreateIssue')}>
                        <Text style={styles.workText}>New Job</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.workBlock} onPress={() => navigation.navigate('MyIssuesPosted')}>
                        <Text style={styles.workText}>See My Posted Jobs</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Help Button */}
            <View style={styles.helpSection}>
                <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpButtonText}>Help</Text>
                </TouchableOpacity>
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    mapContainer: {
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        margin: 16,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    workBlocksContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    workBlocks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    workBlock: {
        backgroundColor: '#f0f0f0',
        width: '48%',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
    },
    workText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    helpSection: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    helpButton: {
        backgroundColor: '#e0e0e0',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    helpButtonText: {
        fontSize: 16,
        color: '#333',
    },
    logoutContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    logoutButton: {
        backgroundColor: '#ffdddd',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#d9534f',
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        marginTop: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#666',
    },
});
