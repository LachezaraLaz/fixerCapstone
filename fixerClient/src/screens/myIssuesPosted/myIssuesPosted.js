import React, {useEffect, useState, useContext, useCallback} from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import {useNavigation, useIsFocused, useFocusEffect} from '@react-navigation/native';
import { styles } from '../../../style/myIssues/myIssuesStyle';
import JobBox from '../../../components/jobBox';
import NotificationButton from "../../../components/notificationButton";
import {en, fr} from '../../../localization'
import { I18n } from "i18n-js";
import LanguageModal from "../../../components/LanguageModal";
import languageStyle from '../../../style/languageStyle';
import { LanguageContext } from "../../../context/LanguageContext";
import { IPAddress } from '../../../ipAddress';

/**
 * @module fixerClient
 */

export default function MyIssuesPosted() {
    const [jobs, setJobs] = useState({ all: [], inProgress: [], completed: [] });
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('inProgress');
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [unreadCount, setUnreadCount] = useState(0);
    let [modalVisible, setModalVisible] = useState(false);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    const inProgressLabel = i18n.locale === "fr" ? "En cours" : "in progress";
    i18n.locale = locale;

    useEffect(() => {
        if (isFocused) {
            fetchJobsForUser();
        }
    }, [isFocused]);

    useFocusEffect(
        useCallback(() => {
            fetchNotificationNumber();
        }, [])
    );

    /**
     * Gets the number of unread notifications
     * @returns {Promise<number|*>} - unread notifications
     */
    const fetchNotificationNumber = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get(`https://fixercapstone-production.up.railway.app/notification`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const readNotifications = response.data.filter(
                (notif) => !notif.isRead
            );

            setUnreadCount(readNotifications.length);
        } catch (error) {
            console.error('Error fetching notifications:', error.message);
            setUnreadCount(0);
        }
    };

    /**
     * Fetches jobs for the logged-in user and updates the state with the fetched jobs.
     * 
     * This function retrieves the user's token from AsyncStorage, decodes it to get the user's email,
     * and then makes an API call to fetch the jobs associated with that email. The jobs are then
     * categorized into 'all', 'inProgress', and 'completed' based on their status and stored in the state.
     * 
     * @async
     * @function fetchJobsForUser
     * @returns {Promise<void>} A promise that resolves when the jobs have been fetched and the state has been updated.
     * @throws Will alert an error message if there is an issue fetching the jobs.
     */
    const fetchJobsForUser = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('You are not logged in');
                return;
            }

            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email;

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/issue/user/${userEmail}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });


            setJobs({
                all: response.data.jobs,
                inProgress: response.data.jobs.filter(job =>
                    job.status?.toLowerCase() === 'in progress' || job.status?.toLowerCase() === 'open' || job.status === inProgressLabel
                ),
                completed: response.data.jobs.filter(job =>
                    job.status === 'Completed' || job.status === 'Closed' || job.status === 'Reopened'
                ),
            });

        } catch (error) {
            Alert.alert('Error fetching jobs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Handles the refresh action by setting the refreshing state to true
     * and fetching jobs for the user.
     */
    const onRefresh = () => {
        setRefreshing(true);
        fetchJobsForUser();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ✅ Custom Header */}
            <View style={styles.customHeader}>
                {/* Fixr Logo/Text */}
                <Text style={styles.headerLogo}>Fixr</Text>

                {/* ✅ Updated Title to "My Issues" */}
                <Text style={styles.headerTitle}>{i18n.t('my_jobs')}</Text>

                {/* Notification Button */}
                <View style={{ position: 'relative' }}>
                    <NotificationButton
                        testID="notification-button"
                        onPress={() => navigation.navigate('NotificationPage')}
                    />
                    {unreadCount > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                right: -2,
                                top: -2,
                                backgroundColor: 'red',
                                borderRadius: 8,
                                width: 16,
                                height: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{
                                color: 'white',
                                fontSize: 10,
                                fontWeight: 'bold' }}>
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ✅ Fixed Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { key: "inProgress", label: `${i18n.t('in_progress')}` },
                    { key: "completed", label: `${i18n.t('completed')}` }
                ].map(({ key, label }) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.tab, selectedTab === key && styles.selectedTab]}
                        onPress={() => setSelectedTab(key)}
                    >
                        <Text style={[styles.tabText, selectedTab === key && styles.selectedTabText]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ScrollView with padding to prevent jobs being hidden */}
            <ScrollView
                style={styles.jobsContainer}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {jobs[selectedTab].length > 0 ? (
                    jobs[selectedTab].map(job => <JobBox key={job.id} job={job} navigation={navigation} />)
                ) : (
                    <Text style={styles.noJobsText}>`${i18n.t('jobs_available')}`</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
