// import list
import * as React from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Button, Alert } from 'react-native';
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
    const [deletingJobId, setDeletingJobId] = useState(null); // State to track the job being deleted
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

    // Function to delete an issue by ID
    const deleteIssue = async (jobId) => {
        setDeletingJobId(jobId); // Start loading for this specific job

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('You are not logged in');
                return;
            }

            const response = await axios.delete(`http://${IPAddress}:3000/issue/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                fetchJobsForUser();
                Alert.alert('Job deleted successfully');
            } else {
                Alert.alert('Failed to delete the job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            Alert.alert('An error occurred while deleting the job');
        } finally {
            setDeletingJobId(null); // Stop loading
        }
    };

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
        <ScrollView style={{ flex: 1, paddingBottom: 200 , marginBottom: 100}}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: "center" }}>My Jobs</Text>

            {jobs.length > 0 ? (
                jobs.map((job, index) => (
                    <View
                        key={index}
                        style={{
                            flexDirection: "column",
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            margin: 5,
                            padding: 10
                        }}>
                        <Text style={{ fontWeight: 'bold' }}>{job.title}</Text>
                        <Text style={{ color: getStatusColor(job.status) }}>{job.status}</Text>
                        <Text>Professional Needed: {job.professionalNeeded}</Text>
                        <Text>{job.description}</Text>
                        {job.imageUrl && (
                            <Image source={{ uri: job.imageUrl }} style={{ width: 100, height: 100, marginTop: 10 }} />
                        )}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                            <Button title="Edit" onPress={() => navigation.navigate('EditIssue', { jobId: job._id })} />
                            {deletingJobId === job._id ? (
                                <ActivityIndicator size="small" color="#0000ff" />
                            ) : (
                                <Button title="Delete Job" onPress={() => deleteIssue(job._id)} disabled={deletingJobId !== null} />
                            )}
                        </View>
                    </View>
                ))
            ) : (
                <Text style={{ textAlign: "center" }}>No jobs posted yet.</Text>
            )}

        </ScrollView>
    );
}
