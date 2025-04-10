import React, {useRef, useEffect, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    PanResponder,
    Animated,
    Image,
    Modal,
    Dimensions,
    Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {styles} from '../../../style/issueDetailScreen/issueDetailScreenStyle';

import {getAddressFromCoords} from '../../../utils/geoCoding_utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomAlertError from '../../../components/customAlertError';

export default function IssueDetailScreen({ issue, issues, onClose }) {
    const navigation = useNavigation();
    const [address, setAddress] = useState('Loading address...');
    const [client, setClient] = useState({firstName: '', lastName: ''});
    const [modalVisible, setModalVisible] = useState(false);
    const [bankingInfoAdded, setBankingInfoAdded] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(() => {
    // Try to find selectedIssue in the issues array
    const index = issues.findIndex(i => i._id === issue?._id || i.id === issue?.id);
        return index >= 0 ? index : 0;
    });
    
    const currentIssue = issues[currentIndex] || issue; // ✅ fallback to the passed-in issue
    const [errorAlertVisible, setErrorAlertVisible] = useState(false);
    const [errorAlertContent, setErrorAlertContent] = useState({ title: '', message: '' });

    // Guard against undefined
    if (!issue) return null;

    /**
     * useEffect hook that fetches and sets the address when the selected issue changes.
     *
     * - Calls `getAddressFromCoords` with the issue's latitude and longitude.
     * - Updates the address state with the formatted result.
     *
     * @function useEffect
     */
    useEffect(() => {
        const fetchAddress = async () => {
            const formattedAddress = await getAddressFromCoords(issue.latitude, issue.longitude);
            setAddress(formattedAddress);
        };
        fetchAddress();
    }, [issue]);

    /**
     * useEffect hook that sets the client information based on the selected issue.
     *
     * - Uses `firstName` and `lastName` from the issue if available.
     * - Defaults to "Unknown" if client info is missing.
     *
     * @function useEffect
     */
    useEffect(() => {
        // Simplified client info handling - using issue props directly
        if (issue.firstName && issue.lastName) {
            setClient({
                firstName: issue.firstName,
                lastName: issue.lastName
            });
        } else {
            setClient({firstName: 'Unknown', lastName: ''});
        }
    }, [issue]);

    /**
     * useEffect hook that checks if the professional has added their banking information.
     *
     * - Retrieves `userId` and `token` from AsyncStorage.
     * - Sends a GET request to the backend to fetch banking info status.
     * - Updates state based on the response.
     *
     * @function useEffect
     */
    useEffect(() => {
        const fetchBankingInfoStatus = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const token = await AsyncStorage.getItem('token');

                if (!userId || !token) {
                    console.error("No userId or token found in AsyncStorage");
                    return;
                }

                const response = await axios.get(`https://fixercapstone-production.up.railway.app/professional/banking-info-status`, {
                    params: { userId },
                    headers: { Authorization: `Bearer ${token}` },
                });

                setBankingInfoAdded(response.data.bankingInfoAdded);
            } catch (error) {
                console.error('Error fetching banking info status:', error.response?.data || error.message);
            }
        };

        fetchBankingInfoStatus();
    }, []);

    // Animation setup
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
    const MIN_HEIGHT = Math.min(SCREEN_HEIGHT * 0.35, MAX_HEIGHT - 60); 

    const modalHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;
    const lastGestureDy = useRef(0);

    /**
     * Interpolates the opacity of a button based on the modal's height.
     *
     * - Fades in the button as the modal expands from `MIN_HEIGHT` to just below `MAX_HEIGHT`.
     * - Clamps the output to keep values within the 0–1 range.
     *
     * @constant {Animated.AnimatedInterpolation} buttonOpacity - The animated opacity value for the button.
     */
    const buttonOpacity = modalHeight.interpolate({
        inputRange: [MIN_HEIGHT, MAX_HEIGHT - 50],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    /**
     * useEffect hook that listens to changes in modal height to toggle scrollability.
     *
     * - Enables scroll when the modal height is near or at its maximum.
     * - Cleans up the listener on component unmount or dependency change.
     *
     * @function useEffect
     */
    useEffect(() => {
        const listener = modalHeight.addListener(({ value }) => {
            setScrollEnabled(value >= MAX_HEIGHT - 5);
        });
        return () => modalHeight.removeListener(listener);
    }, [modalHeight]);

    /**
     * Checks if the user has added a payment method before allowing access to certain features.
     *
     * - If no banking info is found, shows an alert prompting the user to add one.
     * - Navigates to the banking info page if the user chooses to proceed.
     *
     * @function handlePaymentMethodCheck
     * @returns {boolean} - Returns true if payment method exists, false otherwise.
     */
    const handlePaymentMethodCheck = () => {
        if (!bankingInfoAdded) {
            setErrorAlertContent({
                title: 'Payment Method Required',
                message: 'Cannot use this feature until a payment method has been added.',
                buttons: [
                    {
                        text: 'Add Payment Method',
                        onPress: () => {
                            setErrorAlertVisible(false);
                            navigation.navigate('BankingInfoPage');
                        }
                    },
                    {
                        text: 'Cancel',
                        onPress: () => setErrorAlertVisible(false)
                    }
                ]
            });
            setErrorAlertVisible(true);
            
            return false;
        }
        return true;
    };


    /**
     * Handles the action to navigate to a different screen after checking for payment method and closing the modal.
     *
     * - Verifies payment method availability using `handlePaymentMethodCheck`.
     * - Animates the modal to close before navigating.
     * - Navigates to the specified screen with the current issue as a parameter.
     *
     * @function handleAction
     * @param {string} screen - The name of the screen to navigate to.
     */
    const handleAction = async (screen) => {
        if (!handlePaymentMethodCheck()) return;

        if (screen === "ChatScreen") {
            await initializeChat();
        }

        Animated.timing(modalHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start(() => {
            onClose();
            setTimeout(() => navigation.navigate(screen, {issue}), 100);
        });
    };

    const initializeChat = async () => {
        try {
            // Construct the request body with required fields
            const userId = await AsyncStorage.getItem('userId');
            const requestBody = {
                issueTitle: issue?.title,
                clientEmail: issue?.userEmail,
                professionalId: userId,
            };

            // Send the POST request
            const response = await fetch('https://fixercapstone-production.up.railway.app/chat/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            // Handle response
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error from server:', errorData);
            } else {
                const data = await response.json();
                console.log('Chat initialized successfully:', data);
            }
        } catch (error) {
            console.error('Error calling initializeChat:', error);
        }
    };

    /**
     * PanResponder instance that allows the user to drag and resize a modal vertically.
     *
     * - Sets pan responder on vertical drag gesture.
     * - Calculates and sets new modal height dynamically during drag.
     * - On release, determines whether to collapse or expand the modal based on velocity and position.
     *
     * @constant {PanResponderInstance} panResponder - The configured PanResponder for modal interaction.
     */
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
            onPanResponderGrant: () => lastGestureDy.current = modalHeight._value,
            onPanResponderMove: (_, gestureState) => {
                const newHeight = lastGestureDy.current - gestureState.dy;
                modalHeight.setValue(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight)));
            },
            onPanResponderRelease: (_, gestureState) => {
                const newHeight = lastGestureDy.current - gestureState.dy;
                const toValue = (gestureState.vy > 0.5 || newHeight < (MIN_HEIGHT + MAX_HEIGHT) / 2.2)
                    ? MIN_HEIGHT
                    : MAX_HEIGHT;
                Animated.spring(modalHeight, { toValue, friction: 7, useNativeDriver: false }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            testID="modal-container"
            style={[styles.container, {height: modalHeight}]}
            {...panResponder.panHandlers}
        >
            <View style={styles.dragHandle}/>
            <TouchableOpacity testID="close-button" style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={25} color="#fff"/>
            </TouchableOpacity>

            <Animated.ScrollView
                scrollEnabled={scrollEnabled}
                style={{flex: 1}}
                contentContainerStyle={{paddingBottom: 80}}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>{issue?.title || "No Title"}</Text>
                    <View style={styles.userInfo}>
                        <Ionicons name="person-circle-outline" size={45} color="#888"/>
                        <Text style={styles.userName}>{client.firstName} {client.lastName}</Text>
                    </View>

                    <Text style={styles.subtitle}>Description</Text>
                    <Text style={styles.description}>{issue?.description || "No Description"}</Text>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoBox}>
                            <Ionicons name="hammer-outline" size={18} color="#FF5733"/>
                            <Text style={styles.infoText}>{issue?.professionalNeeded || "Unknown Professional"}</Text>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoBox}>
                            <Ionicons name="calendar-outline" size={18} color="#007AFF"/>
                            <Text style={styles.infoText}>Created: {issue?.createdAt?.slice(0, 10) || "Unknown"}</Text>
                        </View>
                    </View>

                    <View style={styles.urgencyContentContainer}>
                        <Text style={styles.subtitle}>Urgency Timeline</Text>
                        <View style={styles.urgencyContainer}>
                            <Text style={styles.urgencyText}>{issue.timeline || "High Priority"}</Text>
                        </View>
                    </View>

                    {issue.imageUrl ? (
                    <>
                        <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={{
                            width: '100%',
                            height: 250,
                            borderColor: 'grey',
                            borderWidth: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f9f9f9',
                        }}
                        >
                            <Image
                                testID="image-touchable"
                                source={{ uri: issue.imageUrl }}
                                style={styles.headerImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>

                        <Modal
                            testID="image-modal"
                            visible={modalVisible}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalBackground}>
                                <TouchableOpacity
                                    testID="image-modal-close"
                                    style={styles.modalCloseIcon}
                                    onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close-circle" size={35} color="#fff" />
                                </TouchableOpacity>
                                <Image
                                    source={{ uri: issue.imageUrl }}
                                    style={styles.zoomedImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </Modal>
                    </>
                    ) : (
                        <View style={{ width: '100%', alignItems: 'center', marginTop: 12 }}>
                            <Text style={{ color: 'grey', fontSize: 14 }}>
                                There is no image for this job
                            </Text>
                        </View>
                    )}


                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={18} color="#f5a623"/>
                        <Text style={styles.locationText}>{address || "No Address Provided"}</Text>
                    </View>
                </View>
            </Animated.ScrollView>

            <Animated.View style={[styles.bottomButtonsContainer, {opacity: buttonOpacity}]}>
                <TouchableOpacity
                    style={[styles.sendQuoteButton, !bankingInfoAdded && styles.disabledTextSendButton]}
                    onPress={() => handleAction('ContractOffer')}
                >
                    <Text style={[styles.sendQuoteButtonText, !bankingInfoAdded && styles.disabledButtonText]}>
                        Send Quote
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.chatButton, !bankingInfoAdded && styles.disabledTextChatButton]}
                    onPress={() => handleAction('ChatScreen')}
                >
                    <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
            </Animated.View>
            <CustomAlertError
                visible={errorAlertVisible}
                title={errorAlertContent.title}
                message={errorAlertContent.message}
                buttons={errorAlertContent.buttons}
                onClose={() => {
                    setErrorAlertVisible(false);
                }}
            />

        </Animated.View>
        
    );
}