import React, { useContext }  from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";

import {LanguageContext} from "../../../context/LanguageContext";
import {I18n} from "i18n-js";
import {en, fr} from "../../../localization";

const NotificationDetail = ({ route }) => {
    const { notification } = route.params;
    const navigation = useNavigation(); // Use the navigation hook

    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

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
    
    const [first, title, last] = correctNotification(notification)

    return (
        <View style={styles.container}>
            <View style={styles.containerHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange" />
                </TouchableOpacity>

                <Text style={styles.title}>{i18n.t('notification_details')}</Text>
            </View>
            <Text style={styles.message}>{i18n.t(`${first}`) + ` "${title}" ` + i18n.t(`${last}`)}</Text>
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
