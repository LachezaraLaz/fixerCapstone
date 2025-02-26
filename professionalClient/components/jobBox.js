import React from 'react';
import { Dimensions, View, Text, Image } from 'react-native';
import { styles } from '../style/myJobs/myJobsStyle';

const JobBox = ({ job, showStatus }) => {
    const screenWidth = Dimensions.get('window').width;
    const isSmallScreen = screenWidth < 360;

    //  status color mapping
    const statusColors = {
        "done": {
            background: "rgba(76, 175, 80, 0.2)",
            border: "rgba(76, 175, 80, 0.8)",
            text: "rgba(76, 175, 80, 1)",
        },
        "accepted": {
            background: "rgba(255, 165, 0, 0.2)",
            border: "rgba(255, 165, 0, 0.8)",
            text: "rgba(255, 165, 0, 1)",
        },
        "pending": {
            background: "rgba(128, 0, 128, 0.2)",
            border: "rgba(128, 0, 128, 0.8)",
            text: "rgba(128, 0, 128, 1)",
        }
    };

    const statusLabels = {
        "done": "Completed",
        "accepted": "In Progress",
        "pending": "Quote Sent"
    };

    return (
        <View style={styles.jobCard}>
            <Image source={{ uri: job.imageUrl || 'https://via.placeholder.com/100' }} style={styles.jobImage} />

            <View style={styles.jobDetails}>
                {/* job title and tag in 1 row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.jobTitle} numberOfLines={1} ellipsizeMode="tail">
                        {job.title}
                    </Text>

                    {/* status tag */}
                    {showStatus && job.status && (
                        <View style={[
                            styles.statusTag,
                            {
                                backgroundColor: statusColors[job.status]?.background || "rgba(211, 211, 211, 0.2)",
                                borderColor: statusColors[job.status]?.border || "rgba(211, 211, 211, 0.8)",
                                paddingHorizontal: isSmallScreen ? 8 : 12,
                                minWidth: isSmallScreen ? 75 : 85,
                            }
                        ]}>
                            <Text style={[styles.statusText, { color: statusColors[job.status]?.text || "#333" }]}>
                                {statusLabels[job.status] || job.status}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.jobLocation}>📍 {job.professionalNeeded || 'Not specified'}</Text>
                <Text style={styles.jobRating}>⭐ {job.rating || 'N/A'} </Text>

                <View style={styles.jobPriceContainer}>
                    <Text style={styles.jobPriceText}>${job.price}</Text>
                </View>
            </View>
        </View>
    );
};

export default JobBox;
