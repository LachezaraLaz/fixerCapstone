import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {Ionicons} from "@expo/vector-icons";

import {LanguageContext} from "../../../context/LanguageContext";
import {I18n} from "i18n-js";
import {en, fr} from "../../../localization";

const OldNotifications = () => {
    const route = useRoute();
    const navigation = useNavigation();

    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    // Retrieve the old & read notifications
    const { oldNotifications } = route.params || { oldNotifications: [] };

    const toggleReadStatus = async (id, isRead) => {
        const token = await AsyncStorage.getItem('token');
        try {
            await axios.patch(
                `https://fixercapstone-production.up.railway.app/notification/${id}/read`,
                { isRead: !isRead },
                { headers: { Authorization: `Bearer ${token}` } }
            );

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
            console.error('Error updating notification status:', error.message);
        }
    };

    // Correct notifications depending on the language selected
    const correctNotification = (item) => {
        const message = item.message;
        let start = '';
        let end = '';

        const first = message.substring(0, message.indexOf('"'));
        const title = message.substring(message.indexOf('"') + 1, message.lastIndexOf('"'));
        const last = message.substring(message.lastIndexOf('"') + 1);

        if (first.includes("Your issue titled"))
            start = 'your_issue_titled';
        else if (first.includes("Congrats"))
            start = 'your_quote_for_the_job_accepted';
        else if (first.includes("Sorry"))
            start = 'your_quote_for_the_job_rejected';

        if (last.includes("has been created successfully."))
            end = 'has_been_created';
        else if (last.includes("has received a new quote."))
            end = 'has_received_a_new_quote';
        else if (last.includes("has been accepted. The job is now in progress."))
            end = 'has_been_accepted';
        else if (last.includes("has been rejected."))
            end = 'has_been_rejected';

        return [start, title, end]
    }

    const renderNotification = ({ item }) => {
        const [first, title, last] = correctNotification(item)

        return (
            <TouchableOpacity
                onPress={() => {
                    toggleReadStatus(item.id, item.isRead);
                    navigation.navigate('NotificationDetail', { notification: item });
                }}
                style={[styles.notificationContainer, styles.readContainer]}
            >
                <Text style={styles.message}>{i18n.t(`${first}`) + ` "${title}" ` + i18n.t(`${last}`)}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    testID="old-notifs-back-button"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>
                <Text style={styles.title}>{i18n.t('old_notifications')}</Text>
            </View>

            {oldNotifications.length === 0 ? (
                <Text style={styles.noNotifications}>
                    {i18n.t('no_old_notifications')}
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
