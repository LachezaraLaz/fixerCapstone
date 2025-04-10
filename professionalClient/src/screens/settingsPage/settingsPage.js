import React, {useState} from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Animated, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlertInfo from "../../../components/customAlertInfo";
import { useChatContext } from '../chat/chatContext';
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * @module professionalClient
 */


export default function SettingsPage({ setIsLoggedIn, navigation }) {

    // For customAlertInfo
    const [infoAlertVisible, setInfoAlertVisible] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [infoTitle, setInfoTitle] = useState('');

    const [loggingOut, setLoggingOut] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const { chatClient } = useChatContext();  // Only if chat functionality exists
    // Function to show "Feature Not Available" alert
    const showFeatureUnavailableAlert = (featureName) => {
        setInfoTitle("Coming Soon");

        // Set specific messages for different features
        if (featureName === "Appearance") {
            setInfoMessage("Appearance customization will be available in a future update.");
        } else if (featureName === "Language") {
            setInfoMessage("Additional language options will be available soon.");
        } else if (featureName === "View Tax Documents") {
            setInfoMessage("Tax document viewing will be implemented soon.");
        } else if (featureName === "Privacy Policy") {
            setInfoMessage("Our privacy policy document will be available soon.");
        } else if (featureName === "Terms & Conditions") {
            setInfoMessage("Our terms and conditions document will be available soon.");
        }

        setInfoAlertVisible(true);
    };

    /**
     * Handles the user logout process.
     *
     * This function performs the following steps:
     * 1. Disconnects the user from the chat client if it exists.
     * 2. Removes the user's token, stream token, user ID, and user name from AsyncStorage.
     * 3. Displays an alert indicating the user has been logged out successfully.
     * 4. Sets the `isLoggedIn` state to false.
     *
     * If an error occurs during the logout process, it logs the error to the console
     * and displays an alert indicating that an error occurred.
     *
     * @async
     * @function handleLogout
     * @returns {Promise<void>} A promise that resolves when the logout process is complete.
     */
    const handleLogout = async () => {
        try {
            // Start the logout process
            setLoggingOut(true);

            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();

            // Perform logout operations
            if (chatClient) {
                await chatClient.disconnectUser();
            }

            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('streamToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userName');

            // Delay for smooth transition
            setTimeout(() => {
                // Fade out before completing logout
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    // Finally set logged out state
                    setIsLoggedIn(false);
                });
            }, 800); // Delay for 800ms to show the message

        } catch (error) {
            console.error("Error logging out: ", error);
            setLoggingOut(false); // Reset state if error
            Alert.alert('Error', 'An error occurred while logging out');
        }
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('ProfilePage'); // fallback
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    testID="back-button"
                >
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("ProfessionalAccountSettingsPage")}>
                    <Text style={styles.optionText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Appearance")}>
                    <Text style={styles.optionText}>Appearance</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Language")}>
                    <Text style={styles.optionText}>Language</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("View Tax Documents")}>
                    <Text style={styles.optionText}>View Tax Documents</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Privacy Policy")}>
                    <Text style={styles.optionText}>Privacy Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => showFeatureUnavailableAlert("Terms & Conditions")}>
                    <Text style={styles.optionText}>Terms & Conditions</Text>
                </TouchableOpacity>

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

            <CustomAlertInfo
                visible={infoAlertVisible}
                title={infoTitle}
                message={infoMessage}
                onClose={() => setInfoAlertVisible(false)}
            />

            {loggingOut && (
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: fadeAnim,
                        zIndex: 1000,
                    }}
                >
                    <ActivityIndicator size="large" color="#f28500" />
                    <Text style={{marginTop: 20, fontSize: 18, fontWeight: 'bold'}}>
                        Logging out...
                    </Text>
                </Animated.View>
            )}

        </SafeAreaView>
    );
}

const styles = {
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        position: 'relative',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        padding: 16,
    },
    option: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    optionText: {
        fontSize: 18,
        color: '#333',
    },
    // logoutContainer: {
    //     marginTop: 30,
    //     alignItems: 'center',
    // },
    // logoutButton: {
    //     backgroundColor: '#d9534f',
    //     paddingVertical: 12,
    //     paddingHorizontal: 20,
    //     borderRadius: 8,
    // },
    // logoutText: {
    //     fontSize: 18,
    //     color: '#fff',
    // },
    logoutContainer: {
        marginTop: 10,
        paddingHorizontal: 16,
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
        marginTop: 20,
        alignItems: 'center',
        padding: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#777',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
};
