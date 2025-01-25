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
import { useNavigation, useIsFocused } from '@react-navigation/native';

import { IPAddress } from '../../../ipAddress';

export default function MyIssuesPosted() {
    // List of fields in the page
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingJobId, setDeletingJobId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [refreshing, setRefreshing] = useState(false); // New state for pull-to-refresh
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            fetchJobsForUser(); // Refresh job data when screen comes into focus
        }
    }, [isFocused]);

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

            const response = await axios.get(`https://fixercapstone-production.up.railway.app/issue/user/${userEmail}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 200) {
                const jobsWithOffers = await Promise.all(
                    response.data.jobs.map(async (job) => {
                        try {
                            const offersResponse = await axios.get(`https://fixercapstone-production.up.railway.app/quotes/job/${job._id}`, {
                                headers: { 'Authorization': `Bearer ${token}` },
                            });

                            return {
                                ...job,
                                offerCount: offersResponse.data.offers.length || 0, // Add the number of offers
                            };
                        } catch (error) {
                            console.error(`Error fetching offers for job ${job._id}:`, error);
                            return {
                                ...job,
                                offerCount: 0, // Default to 0 if fetching offers fails
                            };
                        }
                    })
                );

                setJobs(jobsWithOffers);
                console.log("Successfully loaded all of user's posted jobs with offer counts");
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

            const response = await axios.put(`https://fixercapstone-production.up.railway.app/issue/${jobId}`, {
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
                style={{ padding: 0, marginVertical: -250 }} // Margin to reduce unnecessary space above and below
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }}
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
                style={{ flex: 1, paddingBottom: 0, marginBottom: 0 }}
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
                                padding: 10,
                            }}
                        >
                            <Text style={{ fontWeight: 'bold' }}>{job.title}</Text>
                            <Text style={{ color: getStatusColor(job.status) }}>{job.status}</Text>
                            <Text>Professional Needed: {job.professionalNeeded}</Text>
                            <Text style={{ marginBottom: 10 }}>{job.description}</Text>
                            {job.rating && (
                                <Text style={{ marginBottom: 10 }}>
                                    You Rated this Job a {' '}
                                    <Text style={{
                                        color: '#FFD700'
                                    }}>{job.rating}⭐ </Text>
                                </Text>
                            )}

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


                                {(job.status.toLowerCase() === 'completed' || job.status.toLowerCase() === 'closed') && (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('addReview', { jobId: job._id })}
                                        style={{
                                            borderColor: '#1A8DEC',
                                            borderWidth: 1,
                                            borderRadius: 5,
                                            padding: 5,
                                        }}
                                    >
                                        <Text style={{ color: '#1A8DEC' }}>Add or Modify a Review</Text>
                                    </TouchableOpacity>
                                )}

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
                            {/* Add View Offers Button */}
                            <TouchableOpacity
                                onPress={() => {
                                    if (job.offerCount > 0) {
                                        navigation.navigate('OffersPage', { jobId: job._id });
                                    }
                                }}
                                style={{
                                    marginTop: 10,
                                    backgroundColor:
                                        job.offerCount === 0
                                            ? '#ccc' // Gray color for disabled button
                                            : job.status.toLowerCase() === 'in progress'
                                            ? 'green'
                                            : '#1A8DEC', // Blue color for other statuses
                                    borderRadius: 5,
                                    padding: 10,
                                    alignItems: 'center',
                                }}
                                disabled={job.offerCount === 0} // Disable the button if no offers are available
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                    {job.offerCount === 0
                                        ? 'No Offers Yet' // Show "No Offers Yet" when there are no offers
                                        : job.status.toLowerCase() === 'in progress'
                                        ? 'View Contract' // Show "View Contract" for jobs in progress
                                        : `View ${job.offerCount} Offer${job.offerCount === 1 ? '' : 's'}`}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: "center" }}>No jobs in this status.</Text>
                )}
            </ScrollView>
        </View>
    );
}