import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Modal,
    SafeAreaView,
    RefreshControl
} from "react-native";
import axios from "axios";
import {useRoute, useNavigation, useFocusEffect} from "@react-navigation/native";
import {styles} from "../../../style/issueDetails/issueDetailsStyle";
import {IPAddress} from "../../../ipAddress";
import {Ionicons} from "@expo/vector-icons";
import MapView, {Marker} from "react-native-maps";
import NotificationButton from "../../../components/notificationButton";
import OrangeButton from "../../../components/orangeButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from "react";

const IssueDetails = () => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const {jobId} = route.params;

    useEffect(() => {
        fetchJobDetails();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchJobDetails();
        }, [jobId])
    );

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://fixercapstone-production.up.railway.app/issue/${jobId}`);
            setJob(response.data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch issue details");
        } finally {
            setLoading(false);
            setRefreshing(false)
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6600"/>
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

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobDetails();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 50}}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
                <View style={styles.customHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="orange"/>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Issue Details</Text>
                    <NotificationButton onPress={() => navigation.navigate("NotificationPage")}/>
                </View>

                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.detailLabel}>Professional Needed </Text>
                <Text style={styles.detailValue}>{job.professionalNeeded || "Not specified"}</Text>

                <Text style={styles.detailLabel}>Status </Text>
                <View style={[styles.statusContainer, {
                    backgroundColor: statusStyle.background,
                    borderColor: statusStyle.border
                }]}>
                    <Text style={[styles.statusText, {color: statusStyle.text}]}>
                        {job.status}
                    </Text>
                </View>

                {job.professionalEmail && (
                    <View>
                        <Text style={styles.detailLabel}>Assigned Professional</Text>
                        <Text style={styles.detailValue}> {job.professionalEmail} </Text>
                    </View>
                )}
                <Text style={styles.detailLabel}>Created On</Text>
                <Text style={styles.detailValue}>
                    {new Date(job.createdAt).toDateString()}{" "}
                    {new Date(job.createdAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                </Text>

                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{job.description || "No Description"}</Text>


                {job.imageUrl && job.imageUrl !== 'https://via.placeholder.com/150' && job.imageUrl !== null ? (
                    <View style={styles.imageGrid}>
                        <Text style={styles.detailLabel}>Attached Images</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Image source={{uri: job.imageUrl}} style={styles.jobImage}/>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.detailLabel}>Attached Images</Text>
                        <Text style={styles.detailValue}>No image attached yet</Text>
                    </View>
                )}
                <Modal visible={modalVisible} transparent={true} animationType="fade">
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={30} color="white"/>
                        </TouchableOpacity>
                        <Image source={{uri: job.imageUrl}} style={styles.fullImage}/>
                    </View>
                </Modal>

                <Text style={styles.detailLabel}>Location</Text>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: job.latitude || 0.0,
                        longitude: job.longitude || 0.0,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Marker coordinate={{latitude: job.latitude || 0.0, longitude: job.longitude || 0.0}}/>
                </MapView>

                {job.rating && (
                    <View>
                        <Text style={styles.detailLabel}>Review</Text>
                        <Text>
                            <Text style={styles.detailSubLabel}>Rating: </Text>
                            <Text style={styles.detailValue}>{job.rating} Stars</Text>
                        </Text>
                        <Text>
                            <Text style={styles.detailSubLabel}>Comment: </Text>
                            <Text style={styles.detailValue}>{job.comment || "No comment"}</Text>
                        </Text>

                    </View>
                )}
                {job.status.toLowerCase() === "completed" || job.status.toLowerCase() === "closed" ? (
                    <>
                        <OrangeButton
                            title="Add Review"
                            variant="normal"
                        />
                        <OrangeButton
                            title="Reopen Issue"
                        />
                    </>
                ) : job.status.toLowerCase() === "open" || job.status.toLowerCase() === "pending" ? (
                    <>
                        <OrangeButton
                            title="Modify Issue"
                        />
                        <OrangeButton
                            title="Delete Issue"
                        />
                    </>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
};

export default IssueDetails;