import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Modal } from "react-native";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { styles } from "../../../style/issueDetails/issueDetailsStyle";
import { IPAddress } from "../../../ipAddress";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import NotificationButton from "../../../components/notificationButton";
import OrangeButton from "../../../components/orangeButton";

const IssueDetails = () => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();
    const { jobId } = route.params;

    useEffect(() => {
        fetchJobDetails();
    }, []);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://${IPAddress}:3000/issue/${jobId}`);
            setJob(response.data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch issue details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6600" />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Issue details not found</Text>
            </View>
        );
    }
    const statusColors = {
        "open": {
            background: "rgba(255, 165, 0, 0.2)",
            border: "rgba(255, 165, 0, 0.8)",
            text: "rgba(255, 165, 0, 1)",
        },
        "closed": {
            background: "rgba(76, 175, 80, 0.2)",
            border: "rgba(76, 175, 80, 0.8)",
            text: "rgba(76, 175, 80, 1)",
        },
        "completed": {
            background: "rgba(76, 175, 80, 0.2)",
            border: "rgba(76, 175, 80, 0.8)",
            text: "rgba(76, 175, 80, 1)",
        },
        "pending": {
            background: "rgba(128, 0, 128, 0.2)",
            border: "rgba(128, 0, 128, 0.8)",
            text: "rgba(128, 0, 128, 1)",
        },
    };

    const currentStatus = job.status?.toLowerCase() || "pending";
    const statusStyle = statusColors[currentStatus] || statusColors["pending"];

    const ReopenIssue = async (id) => {
        console.log("in reopen issue", id);
        try {
            // const token = await AsyncStorage.getItem('token');
            // if (!token) {
            //     Alert.alert('You are not logged in');
            //     return;
            // }
            const job2 = await axios.get(`http://${IPAddress}:3000/issue/${jobId}`);
            setJob(job2.data);

            const newStatus = currentStatus.toLowerCase() === 'open' ? 'completed' : 'open';
            console.log("before backened call", id,"new status ", newStatus );
            const id= job.id;
            console.log(id);

            const response = await axios.delete(`http://${IPAddress}:3000/issue/reopen/${id}`,
                { status: newStatus },
                // { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(response);

            if (response.status === 200) {
                Alert.alert(`Job ${newStatus === 'closed' ? 'Closed' : 'Reopened'} successfully`);
            } else {
                Alert.alert(`Failed to ${newStatus === 'closed' ? 'Close' : 'Reopen'} the job`);
            }
        } catch (error) {
            console.error(`Error updating job status to ${newStatus}:`, error);
            Alert.alert(`An error occurred while trying to ${newStatus === 'closed' ? 'Close' : 'Reopen'} the job`);
        }
    };


    return (
        <ScrollView style={styles.container}>
            <View style={styles.customHeader}>
                <Text style={styles.headerLogo}>Fixr</Text>
                <Text style={styles.headerTitle}>My Issues</Text>
                <NotificationButton onPress={() => navigation.navigate("NotificationPage")} />
            </View>

            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.detailLabel}>Professional Needed: </Text>
            <Text style={styles.detailValue}>{job.professionalNeeded || "Not specified"}</Text>

            <Text style={styles.detailLabel}>Status: </Text>
            <View style={[styles.statusContainer, { backgroundColor: statusStyle.background, borderColor: statusStyle.border }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {job.status}
                </Text>
            </View>

            {job.professionalEmail && (
                <View>
                    <Text style={styles.detailLabel}>Assigned Professional</Text>
                    <Text style={styles.detailValue}> {job.professionalEmail}</Text>
                </View>
            )}
            <Text style={styles.detailLabel}>Created On:</Text>
            <Text style={styles.detailValue}>
                {new Date(job.createdAt).toDateString()}{" "}
                {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>

            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{job.description}</Text>


            {job.imageUrl && (
                <View style={styles.imageGrid}>
                    <Text style={styles.detailLabel}>Attached Images</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Image source={{ uri: job.imageUrl }} style={styles.jobImage} />
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.detailLabel}>Location</Text>
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>
                    <Image source={{ uri: job.imageUrl }} style={styles.fullImage} />
                </View>
            </Modal>

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: job.latitude || 0.0,
                    longitude: job.longitude || 0.0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker coordinate={{ latitude: job.latitude || 0.0, longitude: job.longitude || 0.0 }} />
            </MapView>

            {job.rating && (
                <View>
                    <Text style={styles.detailLabel}>Review:</Text>
                    <Text style={styles.detailValue}>Rating: {job.rating}</Text>
                    <Text style={styles.detailValue}>Comment: {job.comment}</Text>
                </View>
            )}

            {job.status.toLowerCase() === "completed" || job.status.toLowerCase() === "closed"? (
                <>
                    <OrangeButton
                        title="Add Review"
                        onPress={() => navigation.navigate("addReview", { jobId })}
                        style={styles.redirectButton}
                    />
                    <OrangeButton
                        title="Reopen Issue"
                        onPress={() => ReopenIssue(job.id)}
                        style={styles.redirectButton}
                    />
                </>
            ) : job.status.toLowerCase() === "open" || job.status.toLowerCase() === "pending" ? (
                <>
                    <OrangeButton
                        title="Modify"
                        onPress={() => navigation.navigate("EditIssue", { jobId })}
                        style={styles.redirectButton}
                    />
                    <OrangeButton
                        title="Delete"
                        onPress={() => navigation.navigate("DeleteJobScreen", { jobId })}
                        style={styles.redirectButton}
                    />
                </>
            ) : null}
        </ScrollView>
    );
};

export default IssueDetails;
