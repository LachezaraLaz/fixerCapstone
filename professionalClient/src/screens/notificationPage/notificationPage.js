import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { IPAddress } from '../../../ipAddress';

/**
 * @module professionalClient
 */

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
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
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

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
            fetchNotifications();  // Refresh list after update
        } catch (error) {
            console.error('Error updating notification status:', error);
        }
    };

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
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
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
});

export default NotificationPage;
