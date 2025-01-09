import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../../style/myJobs/myJobsStyle';


export default function MyJobsProfessional() {
    const [jobs, setJobs] = useState({ done: [], pending: [], active: [] });
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('active'); // State to track the selected tab

    const fetchJobs = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'User token not found.');
                return;
            }

            const response = await axios.get('http://${IPAddress}:3000/myJobs/get', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            Alert.alert('Error', 'Could not fetch jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // Function to render the job list based on the selected tab
    const renderJobs = (status) => {
        const jobList = jobs[status] || [];
        return jobList.map((job, index) => (
            <View key={index} style={styles.jobCard}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobDescription}>{job.description}</Text>
                <Text style={styles.jobPrice}>Price: ${job.price}</Text>
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            {/* Tabs for Active, Pending, Done */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'active' && styles.selectedTab]}
                    onPress={() => setSelectedTab('active')}>
                    <Text style={styles.tabText}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'pending' && styles.selectedTab]}
                    onPress={() => setSelectedTab('pending')}>
                    <Text style={styles.tabText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'done' && styles.selectedTab]}
                    onPress={() => setSelectedTab('done')}>
                    <Text style={styles.tabText}>Done</Text>
                </TouchableOpacity>
            </View>

            {/* Conditionally render jobs based on selected tab */}
            <ScrollView style={styles.jobsContainer}>
                {renderJobs(selectedTab)}
            </ScrollView>
        </View>
    );
}