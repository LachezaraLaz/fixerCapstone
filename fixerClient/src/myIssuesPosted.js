import * as React from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, ScrollView } from 'react-native';

import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';  // Import a JWT decode library


export default function MyIssuesPosted() {
    const [jobs, setJobs] = useState([]);
    // const [loading, setLoading] = useState(true);

    // Function to fetch jobs for the current user
    const fetchJobsForUser = async () => {
        try {
            // Retrieve the token from AsyncStorage
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                alert('You are not logged in');
                return;
            }

            // Decode the token to get the user's email
            const decodedToken = jwtDecode(token);
            const userEmail = decodedToken.email; 
            
            console.log("User's email from token:", userEmail);

            // Fetch jobs from backend filtered by user's email
            const response = await axios.get(`http://192.168.2.22:3000/issue/user/${userEmail}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Send token in the headers if needed
                }
            });

            if (response.status === 200) {
                setJobs(response.data.jobs);  // Assuming your backend sends an array of jobs
            } else {
                alert('Failed to load jobs');
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            alert('An error occurred while fetching jobs');
        } 
        // finally {
        //     setLoading(false);  // Set loading to false once data is fetched
        // }
    };

    // Use useEffect to fetch jobs on component mount
    useEffect(() => {
        fetchJobsForUser();
    }, []);

    // // Show a loading spinner while data is being fetched
    // if (loading) {
    //     return (
    //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //             <ActivityIndicator size="large" color="#0000ff" />
    //         </View>
    //     );
    // }


    return (
        <ScrollView style={{ flex: 1, padding: 20 }}>
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
                    <Text>Professional Needed: {job.professionalNeeded}</Text>
                    <Text>{job.description}</Text>
                    {job.imageUrl && (
                        <Image source={{ uri: job.imageUrl }} style={{ width: 200, height: 200, marginTop: 10 }} />
                    )}
                </View>
            ))
        ) : (
            <Text style={{ textAlign: "center" }}>No jobs posted yet.</Text>
        )}
    </ScrollView>
    );
}
