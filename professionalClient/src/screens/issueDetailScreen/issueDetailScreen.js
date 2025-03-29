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
import DefaultIssueImage from '../../../assets/noImage.png';
import {getAddressFromCoords} from '../../../utils/geoCoding_utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// export default function IssueDetailScreen({issue, onClose}) {
// export default function IssueDetailScreen({ issues = [], onClose }) {
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
      

    // Guard against undefined
    if (!issue) return null;


    useEffect(() => {
        const fetchAddress = async () => {
            const formattedAddress = await getAddressFromCoords(issue.latitude, issue.longitude);
            setAddress(formattedAddress);
        };
        fetchAddress();
    }, [issue]);

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

    const buttonOpacity = modalHeight.interpolate({
        inputRange: [MIN_HEIGHT, MAX_HEIGHT - 50],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        const listener = modalHeight.addListener(({ value }) => {
            setScrollEnabled(value >= MAX_HEIGHT - 5);
        });
        return () => modalHeight.removeListener(listener);
    }, [modalHeight]);

    const handlePaymentMethodCheck = () => {
        if (!bankingInfoAdded) {
            Alert.alert(
                'Payment Method Required',
                'Cannot use this feature until a payment method has been added.',
                [
                    {
                        text: 'Add Payment Method',
                        onPress: () => navigation.navigate('BankingInfoPage')
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ]
            );
            return false;
        }
        return true;
    };

    const handleAction = (screen) => {
        if (!handlePaymentMethodCheck()) return;

        Animated.timing(modalHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start(() => {
            onClose();
            setTimeout(() => navigation.navigate(screen, { issue }), 100);
        });
    };

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
                            <Ionicons name="calendar-outline" size={18} color="#007AFF"/>
                            <Text style={styles.infoText}>Created: {issue?.createdAt?.slice(0, 10) || "Unknown"}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Ionicons name="hammer-outline" size={18} color="#FF5733"/>
                            <Text style={styles.infoText}>{issue?.professionalNeeded || "Unknown Professional"}</Text>
                        </View>
                    </View>

                    <View style={styles.urgencyContentContainer}>
                        <Text style={styles.subtitle}>Urgency Timeline</Text>
                        <View style={styles.urgencyContainer}>
                            <Text style={styles.urgencyText}>{issue.timeline || "High Priority"}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={{width: '100%', height: 250, borderColor: 'grey', borderWidth: 2}}
                    >
                        <Image
                            testID="image-touchable"
                            source={issue.imageUrl ? {uri: issue.imageUrl} : DefaultIssueImage}
                            style={styles.headerImage}
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
                            <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={35} color="#fff"/>
                            </TouchableOpacity>
                            <Image
                                source={issue.imageUrl ? {uri: issue.imageUrl} : DefaultIssueImage}
                                style={styles.zoomedImage}
                                resizeMode="contain"
                            />
                        </View>
                    </Modal>

                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={18} color="#f5a623"/>
                        <Text style={styles.locationText}>{address || "No Address Provided"}</Text>
                    </View>
                </View>
            </Animated.ScrollView>

            <Animated.View style={[styles.bottomButtonsContainer, {opacity: buttonOpacity}]}>
                <TouchableOpacity
                    style={[styles.sendQuoteButton, !bankingInfoAdded && styles.disabledSendButton]}
                    onPress={() => handleAction('ContractOffer')}
                >
                    <Text style={[styles.sendQuoteButtonText, !bankingInfoAdded && styles.disabledButtonText]}>
                        Send Quote
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.chatButton, !bankingInfoAdded && styles.disabledChatButton]}
                    onPress={() => handleAction('ChatScreen')}
                >
                    <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}