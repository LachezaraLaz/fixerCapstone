import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function MyJobsProfessional() {
    const [jobs, setJobs] = useState({ done: [], pending: [], active: [] });
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'User token not found.');
                return;
            }

            const response = await axios.get('http://192.168.2.16:3000/myJobs/get', {
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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.column}>
                <Text style={styles.columnTitle}>Done</Text>
                {jobs.done.map((job, index) => (
                    <View key={index} style={styles.jobCard}>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <Text style={styles.jobDescription}>{job.description}</Text>
                        <Text style={styles.jobPrice}>Price: ${job.price}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.column}>
                <Text style={styles.columnTitle}>Pending</Text>
                {jobs.pending.map((job, index) => (
                    <View key={index} style={styles.jobCard}>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <Text style={styles.jobDescription}>{job.description}</Text>
                        <Text style={styles.jobPrice}>Price: ${job.price}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.column}>
                <Text style={styles.columnTitle}>Active</Text>
                {jobs.active.map((job, index) => (
                    <View key={index} style={styles.jobCard}>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <Text style={styles.jobDescription}>{job.description}</Text>
                        <Text style={styles.jobPrice}>Price: ${job.price}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
    column: { marginBottom: 24 },
    columnTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    jobCard: { backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 8 },
    jobTitle: { fontSize: 16, fontWeight: 'bold' },
    jobDescription: { fontSize: 14, color: '#555' },
    jobPrice: { fontSize: 14, color: '#333', marginTop: 4 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
