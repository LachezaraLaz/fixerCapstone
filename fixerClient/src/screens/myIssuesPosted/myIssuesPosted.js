// import list
import * as React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode'; // Import a JWT decode library
import { useNavigation } from '@react-navigation/native';

import { IPAddress } from '../../../ipAddress';

export default function MyIssuesPosted() {
    // List of fields in the page
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingJobId, setDeletingJobId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [refreshing, setRefreshing] = useState(false); // New state for pull-to-refresh
    const navigation = useNavigation();

    // Function to fetch jobs for the current user
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
            console.log("User's email from token:", userEmail);

            const response = await axios.get(`http://${IPAddress}:3000/issue/user/${userEmail}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200) {
                setJobs(response.data.jobs);
                console.log("Successfully loaded all of users posted jobs");
            } else {
                Alert.alert('Failed to load jobs');
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            Alert.alert('An error occurred while fetching jobs');
        } finally {
            setLoading(false);
            setRefreshing(false); // Stop the refresh control indicator
        }
    };

    useEffect(() => {
        fetchJobsForUser();
    }, []);

    const deleteReopenIssue = async (jobId, currentStatus) => {
        setDeletingJobId(jobId);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('You are not logged in');
                return;
            }

            const newStatus = currentStatus.toLowerCase() === 'open' ? 'Closed' : 'Open';

            const response = await axios.put(`http://${IPAddress}:3000/issue/${jobId}`, {
                status: newStatus
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200) {
                fetchJobsForUser();
                Alert.alert(`Job ${newStatus === 'Closed' ? 'Closed' : 'Reopened'} successfully`);
            } else {
                Alert.alert(`Failed to ${newStatus === 'Closed' ? 'Close' : 'Reopen'} the job`);
            }
        } catch (error) {
            console.error(`Error updating job status to ${newStatus}:`, error);
            Alert.alert(`An error occurred while trying to ${newStatus === 'Closed' ? 'Close' : 'Reopen'} the job`);
        } finally {
            setDeletingJobId(null);
        }
    };

    // Refresh handler
    const onRefresh = () => {
        setRefreshing(true);
        fetchJobsForUser();
    };

    const filteredJobs = selectedStatus === 'all'
        ? jobs
        : jobs.filter(job => job.status.toLowerCase() === selectedStatus.toLowerCase());

    // Show a loading spinner while data is being fetched
    if (loading && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator testID="ActivityIndicator" size="large" color="#0000ff" />
            </View>
        );
    }

    const statusColorMap = {
        'open': '#1A8DEC',
        'closed': 'red',
        'in progress': 'orange',
        'completed': 'green',
    };

    const getStatusColor = (status) => {
        return statusColorMap[status.toLowerCase()] || 'black';
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ padding: 0, margin: 0 }}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
            >
                {['all', 'open', 'in progress', 'completed', 'closed'].map((status, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedStatus(status)}
                        style={{
                            marginHorizontal: 10,
                            paddingVertical: 2,
                            borderBottomWidth: selectedStatus === status ? 2 : 0,
                            borderBottomColor: selectedStatus === status ? '#1A8DEC' : 'transparent',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: selectedStatus === status ? 'bold' : 'normal',
                            color: '#333',
                            textAlign: 'center',
                        }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <ScrollView
                style={{ flex: 1, paddingBottom: 600, marginBottom: 30 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: "column",
                                borderWidth: 1,
                                borderColor: getStatusColor(job.status),
                                borderRadius: 5,
                                margin: 5,
                                padding: 10
                            }}
                        >
                            <Text style={{ fontWeight: 'bold' }}>{job.title}</Text>
                            <Text style={{ color: getStatusColor(job.status) }}>{job.status}</Text>
                            <Text>Professional Needed: {job.professionalNeeded}</Text>
                            <Text style={{ marginBottom: 10 }}>{job.description}</Text>
                            {job.imageUrl && (
                                <Image source={{ uri: job.imageUrl }} style={{ width: 100, height: 100, marginTop: 10 }} />
                            )}
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('EditIssue', { jobId: job._id })}
                                    style={{
                                        borderColor: '#1A8DEC',
                                        borderWidth: 1,
                                        borderRadius: 5,
                                        padding: 5,
                                    }}
                                >
                                    <Text style={{ color: '#1A8DEC' }}>Edit</Text>
                                </TouchableOpacity>
                                {deletingJobId === job._id ? (
                                    <ActivityIndicator size="small" color="#0000ff" />
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => deleteReopenIssue(job._id, job.status)}
                                        disabled={deletingJobId !== null}
                                        style={{
                                            borderColor: '#1A8DEC',
                                            borderWidth: 1,
                                            borderRadius: 5,
                                            padding: 5,
                                        }}
                                    >
                                        <Text style={{ color: '#1A8DEC' }}>
                                            {job.status.toLowerCase() === 'open' ? 'Delete Job' : 'Reopen Job'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: "center" }}>No jobs in this status.</Text>
                )}
            </ScrollView>
        </View>
    );
}
