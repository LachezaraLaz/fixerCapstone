import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from '../style/myIssues/myIssuesStyle';

const JobBox = ({ job, navigation }) => {
    return (
        <TouchableOpacity onPress={() => navigation.navigate('IssueDetails', { jobId: job.id })}>
        <View style={styles.jobCard}>
            <Image
                testID="job-image"
                source={{ uri: job.imageUrl || 'https://via.placeholder.com/100' }} style={styles.jobImage}
            />
            <View style={styles.jobDetails}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobLocation}>📍 {job.professionalNeeded}</Text>
                <Text style={styles.jobRating}>⭐ {job.rating || 'N/A'} </Text>
            </View>

            <View style={styles.jobPriceContainer}>
                <Text style={styles.jobPriceText}>${job.price}</Text>
            </View>
        </View>
        </TouchableOpacity>
    );
};

export default JobBox;
