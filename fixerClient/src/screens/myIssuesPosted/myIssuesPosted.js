// import list
import * as React from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Button, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';  // Import a JWT decode library
import { useNavigation } from '@react-navigation/native';

import { IPAddress } from '../../../ipAddress';


export default function MyIssuesPosted() {
    // List of fields in the page
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingJobId, setDeletingJobId] = useState(null); 
    const [selectedStatus, setSelectedStatus] = useState('all'); 
    const navigation = useNavigation();

    //backend
    // Function to fetch jobs for the current user
    const fetchJobsForUser = async () => {
        try {
            // Retrieve the token from AsyncStorage
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('You are not logged in');
                return;
            }

            // Decode the token to get the user's email
            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email;

            console.log("User's email from token:", userEmail);

            // Fetch jobs from backend filtered by user's email
            const response = await axios.get(`http://${IPAddress}:3000/issue/user/${userEmail}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
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
        }
        finally {
            setLoading(false);  // Set loading to false once data is fetched
        }
    };

    // Use useEffect to fetch jobs on component mount
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
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
    

    const filteredJobs = selectedStatus === 'all'
        ? jobs
        : jobs.filter(job => job.status.toLowerCase() === selectedStatus.toLowerCase());

    // Show a loading spinner while data is being fetched
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator testID="ActivityIndicator" size="large" color="#0000ff" />
            </View>
        );
    }

    // Define a mapping of statuses to colors
    const statusColorMap = {
        'open': '#1A8DEC',
        'closed': 'red',
        'in progress': 'orange',
        'completed': 'green',
    };

     // Helper function to get color based on status
     const getStatusColor = (status) => {
        // Return the corresponding color or default to 'black' if status not found
        return statusColorMap[status.toLowerCase()] || 'black';
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Scrollable Tab Buttons */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                    padding: 0,
                    margin: 0,
                }}
                contentContainerStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // padding: 0,
                    // margin: 0,
                }}
            >
                {['all', 'open', 'in progress', 'completed', 'closed'].map((status, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedStatus(status)}
                        style={{
                            marginHorizontal: 10, // Minimal horizontal margin
                            paddingVertical: 2, // Minimal vertical padding to bring text closer to underline
                  
                            borderBottomWidth: selectedStatus === status ? 2 : 0,
                            borderBottomColor: selectedStatus === status ? '#1A8DEC' : 'transparent',
                            alignItems: 'center', // Center align the text
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
        {/* </View> */}
        <ScrollView style={{ flex: 1, paddingBottom: 600, marginBottom: 30}}>
           
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
                        }}>
                        <Text style={{ fontWeight: 'bold' }}>{job.title}</Text>
                        <Text style={{ color: getStatusColor(job.status) }}>{job.status}</Text>
                        <Text>Professional Needed: {job.professionalNeeded}</Text>
                        <Text style= {{marginBottom: 10}}>{job.description}</Text>
                        {job.imageUrl && (
                            <Image source={{ uri: job.imageUrl }} style={{ width: 100, height: 100, marginTop: 10 }} />
                        )}
                        <View style={{ flexDirection: "row", justifyContent: "space-between"}}>
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
