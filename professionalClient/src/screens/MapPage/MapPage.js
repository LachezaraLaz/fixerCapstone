import * as React from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { styles } from '../../../style/homeScreenStyle';
import axios from 'axios';
import { IPAddress } from '../../../ipAddress';

export default function MapPage() {
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
                setLoading(false);
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
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        setLoading(true);
        fetchAllIssues();
        getCurrentLocation();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                        onPress={() => Alert.alert(issue.title, issue.description)}
                    />
                ))}
            </MapView>
        </View>
    );
}

