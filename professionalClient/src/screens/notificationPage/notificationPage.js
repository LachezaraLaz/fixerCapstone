import React, {useState, useEffect, useLayoutEffect} from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OrangeButton from "../../../components/orangeButton";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { IPAddress } from '../../../ipAddress';
import {Ionicons} from "@expo/vector-icons";

/**
 * @module professionalClient
 */

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);          // Track loading state
    const [hasMore, setHasMore] = useState(true);           // Track if more notifications are available
    const [page, setPage] = useState(1);                    //
    const navigation = useNavigation(); // Use the navigation hook

    useEffect(() => {
        fetchNotifications();
    }, []);

    /**
     * Fetches notifications from the server.
     * 
     * This function retrieves the user's token from AsyncStorage and uses it to
     * make an authenticated GET request to the notifications endpoint. If the
     * request is successful, the notifications are stored in the state. If there
     * is an error during the request, it is logged to the console.
     * 
     * @async
     * @function fetchNotifications
     * @returns {Promise<void>} A promise that resolves when the notifications have been fetched and set in the state.
     */
    const fetchNotifications = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get(`https://fixercapstone-production.up.railway.app/notification`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sorted = sortNotifications(response.data);
            setNotifications(sorted);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // /**
    //  * Fetches more notifications from the server and updates the state.
    //  *
    //  * This function will fetch additional notifications from the server if not currently loading and if there are more notifications to fetch.
    //  * It retrieves the token from AsyncStorage and makes a GET request to the notification history endpoint.
    //  * If new notifications are received, they are added to the existing notifications state.
    //  * If no more notifications are available, it updates the state to indicate that there are no more notifications.
    //  *
    //  * @async
    //  * @function fetchMoreNotifications
    //  * @returns {Promise<void>} A promise that resolves when the notifications have been fetched and the state has been updated.
    //  */
    // const fetchMoreNotifications = async () => {
    //     if (loading || !hasMore) return;
    //
    //     setLoading(true);
    //     const token = await AsyncStorage.getItem('token');
    //     try {
    //         const response = await axios.get('https://fixercapstone-production.up.railway.app/notification/history', {
    //             headers: { Authorization: `Bearer ${token}` },
    //             params: { page, limit: 5 }, // Fetch 5 notifications at a time
    //         });
    //
    //         if (Array.isArray(response.data) && response.data.length > 0) {
    //             const newNotifications = response.data.filter(
    //                 (newNotification) => !notifications.some((notif) => notif._id === newNotification._id)
    //             );
    //             const merged = [...notifications, ...newNotifications];
    //             const sorted = sortNotifications(merged);
    //             setNotifications(sorted);
    //             setPage((prevPage) => prevPage + 1);
    //         } else {
    //             setHasMore(false); // No more notifications
    //         }
    //     } catch (error) {
    //         console.error('Error fetching more notifications:', error.message);
    //         setHasMore(false);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    /**
     * Toggles the read status of a notification.
     * 
     * @param {string} id - The ID of the notification to update.
     * @param {boolean} isRead - The current read status of the notification.
     * @returns {Promise<void>} - A promise that resolves when the update is complete.
     * @throws {Error} - Throws an error if the update fails.
     */
    const toggleReadStatus = async (id, isRead) => {
        const token = await AsyncStorage.getItem('token');
        try {
            await axios.patch(`https://fixercapstone-production.up.railway.app/notification/${id}/read`, { isRead: !isRead }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => {
                const updated = prev.map((notification) =>
                    notification._id === id
                        ? { ...notification, isRead: !isRead }
                        : notification
                );
                fetchNotifications();

                return sortNotifications(updated);
            });
        } catch (error) {
            console.error('Error updating notification status:', error);
        }
    };

    // Old notifications
    const notifTimeLimit = 4 * 24 * 60 * 60 * 1000;    // 4 days
    const now = new Date();

    // New list
    const currentNotifications = notifications.filter((n) => {
        const isOlderThanFiveDays = (now - new Date(n.createdAt)) > notifTimeLimit;
        return !(n.isRead && isOlderThanFiveDays);
    });

    // Old List
    const oldNotifications = notifications.filter((n) => {
        const isOlderThanFiveDays = (now - new Date(n.createdAt)) > notifTimeLimit;
        return n.isRead && isOlderThanFiveDays;
    });

    /**
     * Renders a notification item as a touchable component.
     *
     * @param {Object} param - The parameter object.
     * @param {Object} param.item - The notification item to render.
     * @param {string} param.item.id - The unique identifier of the notification.
     * @param {boolean} param.item.isRead - The read status of the notification.
     * @param {string} param.item.message - The message content of the notification.
     * @param {string} param.item.createdAt - The creation date of the notification.
     * @returns {JSX.Element} The rendered notification item component.
     */
    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                toggleReadStatus(item.id, item.isRead); // Mark as read
                navigation.navigate('NotificationDetail', { notification: item }); // Navigate to detail page
            }}
            style={[styles.notificationContainer, item.isRead ? styles.readBox : styles.unreadBox]}
        >
            <Text style={item.isRead ? styles.readMessage : styles.unreadMessage}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
        </TouchableOpacity>
    );

    /**
     * Sorts the notification list, starting with the unread ones
     * @param array - notifications
     * @returns {*}
     */
    const sortNotifications = (array) => {
        return array.slice().sort((a, b) => {
            if (a.isRead && !b.isRead) return 1;  // b should come before a
            if (!a.isRead && b.isRead) return -1; // a should come before b
            return 0; // If both unread or both read, leave as-is
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.containerHeader}>
                {/*    <>*/}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>

                <Text style={styles.title}>Notifications</Text>
                {/*    </>*/}
            </View>
            {currentNotifications.length === 0 ? (
                <Text style={styles.noNotifications}>No notifications available</Text>
            ) : (
                <>
                    <FlatList
                        data={currentNotifications}
                        style={styles.list}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                    />
                    {/*{hasMore ? (*/}
                    {/*    <OrangeButton*/}
                    {/*        style={{marginTop: 0}}*/}
                    {/*        title='Load More'*/}
                    {/*        onPress={fetchMoreNotifications}*/}
                    {/*        disabled={loading}*/}
                    {/*    />*/}
                    {/*) : (*/}
                    {/*    <OrangeButton*/}
                    {/*        style={{marginTop: 0}}*/}
                    {/*        title="No more notifications"*/}
                    {/*        disabled={true}*/}
                    {/*    />*/}
                    {/*    )*/}
                    {/*}*/}
                    <OrangeButton
                        title="View Old Notifications"
                        onPress={() => navigation.navigate('OldNotifications', { oldNotifications })}
                        style={{ marginVertical: 0 }}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20,
        backgroundColor: '#fff' 
    },
    containerHeader: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        backgroundColor: '#fff',
        paddingTop: 10,
    },
    title: { 
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    backButton: {
        position: 'absolute',
        left: 4,
        top:10,
    },
    list: {
        marginTop: 10,
        marginBottom: -20,
    },
    notificationContainer: {
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 10,
        marginVertical: 8,
        // Simple shadow on iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 2,
    },
    readMessage: { 
        fontSize: 16, 
        color: 'black' 
    },
    unreadMessage: { 
        fontSize: 16, 
        color: 'white' 
    },
    date: { 
        fontSize: 12, 
        color: 'gray' 
    },
    readBox: { 
        backgroundColor: 'white', 
        borderWidth: 1, 
        borderColor: 'orange' 
    },
    unreadBox: { 
        backgroundColor: 'orange' 
    },
    noNotifications: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20
    },
});

export default NotificationPage;
