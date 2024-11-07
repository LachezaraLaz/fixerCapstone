import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IPAddress } from '../../../ipAddress';


const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get(`https://${IPAddress}:3000/notification`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const toggleReadStatus = async (id, isRead) => {
        const token = await AsyncStorage.getItem('token');
        try {
            await axios.patch(`https://${IPAddress}:3000/notification/${id}`, { isRead: !isRead }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchNotifications();  // Refresh list after update
        } catch (error) {
            console.error('Error updating notification status:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => toggleReadStatus(item._id, item.isRead)}>
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
                keyExtractor={(item) => item._id}
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
