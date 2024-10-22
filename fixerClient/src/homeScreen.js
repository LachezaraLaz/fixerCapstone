import * as React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert} from 'react-native';
import MapView from 'react-native-maps';
import { styles } from '../style/homeScreenStyle';  // Import the styles
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
        <View style={styles.container}>
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
                <ScrollView contentContainerStyle={styles.workBlocks}>
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
                        <Text style={styles.workText}>See my Posted Jobs</Text>
                    </TouchableOpacity>
                    <View style={styles.workBlock}>
                        <Text style={styles.workText}>Electrician</Text>
                    </View>
                </ScrollView>
            </View>

            <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.
                </Text>
            </View>
        </View>
    );
}
