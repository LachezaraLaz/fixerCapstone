import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationButton from "../../../components/notificationButton";
import JobBox from '../../../components/jobBox';
import { styles } from '../../../style/myJobs/myJobsStyle';
import { IPAddress } from '../../../ipAddress';


export default function MyJobsProfessional() {
    const [jobs, setJobs] = useState({ all: [], done: [], pending: [], active: [] });
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('active');
    const [refreshing, setRefreshing] = useState(false);
    const [amountEarned, setAmountEarned] = useState(0);
    const navigation = useNavigation();

    const fetchJobs = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'User token not found.');
                return;
            }

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/myJobs/get`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { all = [], active = [], pending = [], done = [], amountEarned = 0 } = response.data;

            setJobs({
                all,
                active,
                pending,
                done,
            });

            setAmountEarned(amountEarned);

        } catch (error) {
            console.error('Error fetching jobs:', error);
            Alert.alert('Error', 'Could not fetch jobs.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color="#0000ff"
                    testID="loading-indicator"
                />
            </View>
        );
    }

    // Function to render the job list based on the selected tab
    const renderJobs = (status) => {
        let jobList = jobs[status] || [];

        return jobList.length > 0 ? (
            jobList.map((job, index) => (
                <JobBox
                    key={job._id || index}
                    job={job}
                    navigation={navigation}
                    showStatus={selectedTab === "all"}
                />
            ))
        ) : (
            <Text style={styles.noJobsText}>No jobs available</Text>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.customHeader}>
                <Text style={styles.headerLogo}>Fixr</Text>
                <Text style={styles.headerTitle}>My Jobs</Text>
                <NotificationButton onPress={() => navigation.navigate('NotificationPage')} />
            </View>

            <View style={styles.tabsContainer}>
                {[
                    { key: "all", label: "All" },
                    { key: "active", label: "In Progress" },
                    { key: "done", label: "Completed" },
                    { key: "pending", label: "Quote Sent" },
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

            <ScrollView
                style={styles.jobsContainer}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.amountContainer}>
                    <Text style={styles.amountEarned}>
                        Amount Earned: <Text style={styles.amountValue}>${amountEarned}</Text>
                    </Text>
                </View>
                {renderJobs(selectedTab)}
            </ScrollView>
        </SafeAreaView>
    );
}