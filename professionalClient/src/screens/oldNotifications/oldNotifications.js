import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {Ionicons} from "@expo/vector-icons";

const OldNotifications = () => {
    const route = useRoute();
    const navigation = useNavigation();

    // Retrieve the old & read notifications
    const { oldNotifications } = route.params || { oldNotifications: [] };

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

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                toggleReadStatus(item.id, item.isRead); // Mark as read
                navigation.navigate('NotificationDetail', { notification: item }); // Navigate to detail page
            }}
            style={[styles.notificationContainer, styles.readContainer]}
        >
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    testID="old-notifs-back-button"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>
                <Text style={styles.title}>Old Notifications</Text>
            </View>

            {oldNotifications.length === 0 ? (
                <Text style={styles.noNotifications}>
                    No old notifications to display.
                </Text>
            ) : (
                <FlatList
                    data={oldNotifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNotification}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    header: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 10,
    },
    backButton: {
        position: 'absolute',
        left: 4,
        top: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    notificationContainer: {
        borderRadius: 12,
        padding: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    readContainer: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'orange',
    },
    message: {
        fontSize: 16,
        color: 'black'
    },
    date: {
        fontSize: 12,
        color: 'gray'
    },
    noNotifications: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20
    },
});

export default OldNotifications;

