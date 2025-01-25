import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Animated, Modal, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { styles } from '../style/homescreen/homeScreenStyle';
import { IPAddress } from '../ipAddress';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatContext } from './screens/chat/chatContext';

export default function HomeScreen({ navigation, setIsLoggedIn }) {
    const [issues, setIssues] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentLocation, setCurrentLocation] = React.useState(null);
    const [selectedIssue, setSelectedIssue] = React.useState(null);
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [price, setPrice] = React.useState('');
    const [selectedFilters, setSelectedFilters] = React.useState([]);
    const [typesOfWork, setTypesOfWork] = React.useState([]);
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { chatClient } = useChatContext();

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

    const handleFilterSelect = (type) => {
        if (selectedFilters.includes(type)) {
            setSelectedFilters(selectedFilters.filter((filter) => filter !== type));
        } else {
            setSelectedFilters([...selectedFilters, type]);
        }
    };

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

    const handleIssueClick = (issue) => {
        setSelectedIssue(issue);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setSelectedIssue(null);
        setPrice('');
        setIsModalVisible(false);
    };

    const submitQuote = async () => {
        if (!price) {
            Alert.alert('Error', 'Please enter a price before submitting the quote.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'User token not found.');
                return;
            }
            console.log('selectedIssue:', selectedIssue);

            if (!selectedIssue || !selectedIssue.userEmail) {
                console.log('clientEmail is null or undefined');
                Alert.alert('Error', 'Unable to retrieve client email from the selected issue.');
                return;
            }

            const clientEmail = selectedIssue.userEmail; // Use userEmail from the schema
            const issueId = selectedIssue._id;

            const response = await axios.post(
                `https://fixercapstone-production.up.railway.app/quotes/create`,
                { clientEmail, price, issueId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                Alert.alert('Success', 'Quote submitted successfully!');
                closeModal();
            } else {
                Alert.alert('Error', 'Failed to submit the quote.');
            }
        } catch (error) {
            if (error.response?.status === 400) {
                Alert.alert('Error', 'You have already submitted a quote for this issue.');
            } else {
                console.error('Error submitting quote:', error);
                Alert.alert('Error', 'An error occurred while submitting the quote.');
            }
        }
    };

    const navigateToIssueDetails = () => {
        if (selectedIssue) {
            closeModal();
            navigation.navigate('ContractOffer', { issue: selectedIssue });
        }
    };

    const filteredIssues = selectedFilters.length > 0
        ? issues.filter(issue => selectedFilters.includes(issue.professionalNeeded))
        : issues;

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const mapHeight = scrollY.interpolate({
        inputRange: [0, 500],
        outputRange: [400, 150],
        extrapolate: 'clamp',
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }]}>
                <TouchableOpacity onPress={() => navigation.navigate('ProfilePage')}>
                    <Ionicons name="person-circle" size={32} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('NotificationPage')}>
                    <Ionicons name="notifications-outline" size={28} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}>
                {typesOfWork.map((type, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleFilterSelect(type)}
                        style={[
                            styles.filterButton,
                            selectedFilters.includes(type) && styles.filterButtonSelected,
                        ]}
                    >
                        <Text style={styles.filterButtonText}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
                testID="quotemodal"
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Ionicons name="close-outline" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{selectedIssue?.title}</Text>
                        <Text style={styles.modalDescription}>{selectedIssue?.description}</Text>
                        <Text style={styles.modalStatus}>Status: {selectedIssue?.status}</Text>
                        <TextInput
                            style={styles.priceInput}
                            placeholder="Enter price for this issue"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity onPress={navigateToIssueDetails} style={styles.moreInfoButton}>
                                <Text style={styles.buttonText}>More Info</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={submitQuote} style={styles.submitButton}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
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
                        {filteredIssues.map((issue) => (
                            <Marker
                                key={issue._id}
                                testID={`marker-${issue._id}`}
                                coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
                                title={issue.title}
                                description={issue.description}
                                onPress={() => handleIssueClick(issue)}
                            />
                        ))}
                    </MapView>
                </Animated.View>

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
