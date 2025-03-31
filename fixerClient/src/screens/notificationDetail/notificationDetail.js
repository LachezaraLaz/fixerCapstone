import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";

const NotificationDetail = ({ route }) => {
    const { notification } = route.params;
    const navigation = useNavigation(); // Use the navigation hook

    return (
        <View style={styles.container}>
            <View style={styles.containerHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>

                <Text style={styles.title}>Notification Details</Text>
            </View>
            <Text style={styles.message}>{notification.message}</Text>
            <Text style={styles.date}>{new Date(notification.createdAt).toLocaleString()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    containerHeader: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
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
    message: {
        fontSize: 16,
        marginBottom: 20
    },
    date: {
        fontSize: 12,
        color: 'gray'
    },
});

export default NotificationDetail;
