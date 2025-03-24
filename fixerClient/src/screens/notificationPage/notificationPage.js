import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { IPAddress } from '../../../ipAddress';

/**
 * @module fixerClient
 */

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]); // Store notifications
    const [loading, setLoading] = useState(false);          // Track loading state
    const [hasMore, setHasMore] = useState(true);           // Track if more notifications are available
    const [page, setPage] = useState(1);                    // Current page for "Load More"
    const navigation = useNavigation();                     // Navigation hook

    useEffect(() => {
        fetchNotifications();
    }, []);

    /**
     * Fetches notifications from the server.
     * 
     * This function retrieves the user's token from AsyncStorage and uses it to
     * make an authenticated GET request to the notifications endpoint. The
     * notifications are then stored in the state. If an error occurs during the
     * request, it is logged to the console. The loading state is managed before
     * and after the request.
     * 
     * @async
     * @function fetchNotifications
     * @returns {Promise<void>} A promise that resolves when the notifications have been fetched and the state has been updated.
     */
    const fetchNotifications = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get(`https://fixercapstone-production.up.railway.app/notification`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetches more notifications from the server and updates the state.
     * 
     * This function will fetch additional notifications from the server if not currently loading and if there are more notifications to fetch.
     * It retrieves the token from AsyncStorage and makes a GET request to the notification history endpoint.
     * If new notifications are received, they are added to the existing notifications state.
     * If no more notifications are available, it updates the state to indicate that there are no more notifications.
     * 
     * @async
     * @function fetchMoreNotifications
     * @returns {Promise<void>} A promise that resolves when the notifications have been fetched and the state has been updated.
     */
    const fetchMoreNotifications = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get('https://fixercapstone-production.up.railway.app/notification/history', {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit: 5 }, // Fetch 5 notifications at a time
            });

            if (Array.isArray(response.data) && response.data.length > 0) {
                const newNotifications = response.data.filter(
                    (newNotification) => !notifications.some((notif) => notif._id === newNotification._id)
                );
                setNotifications((prevNotifications) => [...prevNotifications, ...newNotifications]);
                setPage((prevPage) => prevPage + 1);
            } else {
                setHasMore(false); // No more notifications
            }
        } catch (error) {
            console.error('Error fetching more notifications:', error.message);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Toggles the read status of a notification.
     *
     * @param {string} id - The ID of the notification to update.
     * @param {boolean} isRead - The current read status of the notification.
     * @returns {Promise<void>} - A promise that resolves when the read status has been updated.
     * @throws {Error} - Throws an error if the update request fails.
     */
    const toggleReadStatus = async (id, isRead) => {
        const token = await AsyncStorage.getItem('token');
        try {
            await axios.patch(
                `https://fixercapstone-production.up.railway.app/notification/${id}/read`,
                { isRead: !isRead },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification._id === id ? { ...notification, isRead: !isRead } : notification
                )
            );
        } catch (error) {
            console.error('Error updating notification status:', error.message);
        }
    };

    /**
     * Renders a notification item.
     *
     * @param {Object} param - The parameter object.
     * @param {Object} param.item - The notification item.
     * @param {string} param.item.id - The unique identifier of the notification.
     * @param {boolean} param.item.isRead - The read status of the notification.
     * @param {string} param.item.message - The message content of the notification.
     * @param {string} param.item.createdAt - The creation date of the notification.
     * @returns {JSX.Element} The rendered notification component.
     */
    const renderNotification = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                toggleReadStatus(item.id, item.isRead);
                navigation.navigate('NotificationDetail', { notification: item });
            }}
        >
            <View style={[styles.notification, item.isRead ? styles.read : styles.unread]}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notifications</Text>
            {notifications.length === 0 ? (
                <Text style={styles.noNotifications}>No notifications available</Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNotification}
                    ListFooterComponent={
                        hasMore ? (
                            <TouchableOpacity
                                style={styles.loadMoreButton}
                                onPress={fetchMoreNotifications}
                                disabled={loading}
                            >
                                <Text style={styles.loadMoreText}>
                                    {loading ? 'Loading...' : 'Load More'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.noMoreNotifications}>No more notifications</Text>
                        )
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    notification: { padding: 15, marginBottom: 10, borderRadius: 5 },
    message: { fontSize: 16 },
    date: { fontSize: 12, color: 'gray' },
    read: { backgroundColor: '#d3d3d3' },
    unread: { backgroundColor: '#add8e6' },
    noNotifications: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 20 },
    loadMoreButton: {
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        marginTop: 20,
        alignItems: 'center',
    },
    loadMoreText: { color: 'white', fontSize: 16 },
    noMoreNotifications: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default NotificationPage;
