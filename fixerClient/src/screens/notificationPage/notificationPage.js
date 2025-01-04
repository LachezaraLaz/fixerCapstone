import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]); // Store notifications
    const [loading, setLoading] = useState(false);          // Track loading state
    const [hasMore, setHasMore] = useState(true);           // Track if more notifications are available
    const [page, setPage] = useState(1);                    // Current page for "Load More"
    const navigation = useNavigation();                     // Navigation hook

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get('http://${IPAddress}:3000/notification', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreNotifications = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get('http://${IPAddress}:3000/notification/history', {
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

    const toggleReadStatus = async (id, isRead) => {
        const token = await AsyncStorage.getItem('token');
        try {
            await axios.patch(
                `http://${IPAddress}:3000/notification/${id}/read`,
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

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                toggleReadStatus(item._id, item.isRead);
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
                    keyExtractor={(item) => item._id}
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
