import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    PanResponder,
    Animated,
    Image,
    Modal,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../style/issueDetailScreen/issueDetailScreenStyle';
import DefaultIssueImage from '../../../assets/noImage.png';
import { getAddressFromCoords } from '../../../utils/geoCoding_utils';
import {getClientByEmail} from "../../../utils/getClientByEmail";


export default function IssueDetailScreen({ issue, onClose }) {
    const navigation = useNavigation();
    const [address, setAddress] = useState('Loading address...');
    const [client, setClient] = useState({ firstName: '', lastName: '' });
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        const fetchAddress = async () => {
            const formattedAddress = await getAddressFromCoords(issue.latitude, issue.longitude);
            setAddress(formattedAddress);
        };

        fetchAddress();
    }, [issue]);

    useEffect(() => {
        const fetchClient = async () => {
            const fetchedClient = await getClientByEmail(issue.userEmail);
            if (fetchedClient) {
                setClient(fetchedClient);
            } else {
                setClient({ firstName: 'Unknown', lastName: '' });
            }
        };

        fetchClient();
    }, [issue.clientEmail]);

    // Animated value to control modal height (Start at Half-Screen)
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const MAX_HEIGHT = SCREEN_HEIGHT * 0.9;  // Fully Expanded Modal Height (90%)
    const MIN_HEIGHT = SCREEN_HEIGHT * 0.35; // Collapsed Modal Height (35%)

    const modalHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;
    const lastGestureDy = useRef(0);

    // Animated opacity for "View More Details" button
    const buttonOpacity = modalHeight.interpolate({
        inputRange: [MIN_HEIGHT, MAX_HEIGHT - 50], // Buttons appear fully near top
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });


    // PanResponder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,

            onPanResponderGrant: () => {
                lastGestureDy.current = modalHeight._value;  // Save initial height
            },

            onPanResponderMove: (_, gestureState) => {
                const newHeight = lastGestureDy.current - gestureState.dy;
                // Clamp height to stay within limits
                modalHeight.setValue(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight)));
            },

            onPanResponderRelease: (_, gestureState) => {
                const newHeight = lastGestureDy.current - gestureState.dy;

                let toValue;
                if (gestureState.vy > 0.5 || newHeight < (MIN_HEIGHT + MAX_HEIGHT) / 2.2) {
                    toValue = MIN_HEIGHT;
                } else {
                    toValue = MAX_HEIGHT;
                }

                Animated.spring(modalHeight, {
                    toValue,
                    friction: 7,
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;


    return (
        <Animated.View
            testID="modal-container"
            style={[
                styles.container,
                { height: modalHeight }
            ]}
            {...panResponder.panHandlers}
        >

            {/* Drag handle */}
            <View style={styles.dragHandle} />

            {/* Close Button */}
            <TouchableOpacity testID="close-button" style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={25} color="#fff" />
            </TouchableOpacity>

            {/* Issue Details */}
            <View style={styles.content}>
                <Text style={styles.title}>{issue?.title || "No Title"}</Text>


                <View style={styles.userInfo}>
                    <Ionicons name="person-circle-outline" size={45} color="#888" />
                    <Text style={styles.userName}>{client.firstName} {client.lastName}</Text>
                </View>


                <Text style={styles.subtitle}>Description</Text>
                <Text style={styles.description}>{issue?.description || "No Description"}</Text>

                {/* Issue Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoBox}>
                        <Ionicons name="calendar-outline" size={18} color="#007AFF" />
                        <Text style={styles.infoText}>Created: {issue?.createdAt?.slice(0, 10) || "Unknown"}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Ionicons name="hammer-outline" size={18} color="#FF5733" />
                        <Text style={styles.infoText}>{issue?.professionalNeeded || "Unknown Professional"}</Text>
                    </View>
                </View>

                {/* Urgency Container */}
                <View style={styles.urgencyContentContainer}>
                    <Text style={styles.subtitle}>Urgency Timeline</Text>
                    <View style={styles.urgencyContainer}>
                        <Text style={styles.urgencyText}>{issue.priority || "High Priority"}</Text>
                    </View>
                </View>

                {/* Header Image */}
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={{ width: '100%', height: 250 }}
                >
                    <Image
                        source={issue.imageUrl ? { uri: issue.imageUrl } : DefaultIssueImage}
                        style={styles.headerImage}
                    />
                </TouchableOpacity>

                {/* Image Zoom Modal */}
                <Modal
                    testID="image-modal"
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalBackground}>
                        <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setModalVisible(false)}>
                            <Ionicons name="close-circle" size={35} color="#fff" />
                        </TouchableOpacity>

                        <Image
                            source={issue.imageUrl && issue.imageUrl.trim() !== '' ? { uri: issue.imageUrl } : DefaultIssueImage}
                            style={styles.zoomedImage}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>

                {/* Address */}
                <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={18} color="#f5a623" />
                    <Text style={styles.locationText}>{address || "No Address Provided"}</Text>
                </View>
            </View>

            {/* Send a quote Button (Hidden until fully expanded) */}
            <Animated.View style={[styles.bottomButtonsContainer, { opacity: buttonOpacity }]}>
                <TouchableOpacity style={styles.sendQuoteButton} onPress={() => {
                    Animated.timing(modalHeight, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                    }).start(() => {
                        onClose();
                        setTimeout(() => navigation.navigate('ContractOffer', { issue }), 100);
                    });
                }}>
                    <Text style={styles.sendQuoteButtonText}>Send Quote</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.chatButton} onPress={() => {
                    Animated.timing(modalHeight, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                    }).start(() => {
                        onClose();
                        setTimeout(() => navigation.navigate('ChatScreen', { issue }), 100);
                    });
                }}>
                    <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}