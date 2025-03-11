import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useNavigation, useIsFocused } from '@react-navigation/native';

import { styles } from '../../../style/myIssues/myIssuesStyle';
import JobBox from '../../../components/jobBox';
import NotificationButton from "../../../components/notificationButton";
import { IPAddress } from '../../../ipAddress';

export default function MyIssuesPosted() {
    const [jobs, setJobs] = useState({ all: [], inProgress: [], completed: [] });
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('inProgress');
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            fetchJobsForUser();
        }
    }, [isFocused]);

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
                    job.status === 'In Progress' || job.status === 'Open'
                ),
                completed: response.data.jobs.filter(job =>
                    job.status === 'Completed' || job.status === 'Closed'
                ),
            });

        } catch (error) {
            Alert.alert('Error fetching jobs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

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
                <Text style={styles.headerTitle}>My Issues</Text>

                {/* Notification Button */}
                <NotificationButton onPress={() => navigation.navigate('NotificationPage')} />
            </View>

            {/* ✅ Fixed Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { key: "inProgress", label: "In Progress" },
                    { key: "completed", label: "Completed" }
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
                    jobs[selectedTab].map(job => <JobBox key={job._id} job={job} navigation={navigation} />)
                ) : (
                    <Text style={styles.noJobsText}>No jobs available</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
