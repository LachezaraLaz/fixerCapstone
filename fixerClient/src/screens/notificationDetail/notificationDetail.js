import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationDetail = ({ route }) => {
    const { notification } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.message}>{notification.message}</Text>
            <Text style={styles.date}>{new Date(notification.createdAt).toLocaleString()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    message: { fontSize: 16, marginBottom: 20 },
    date: { fontSize: 12, color: 'gray' },
});

export default NotificationDetail;
