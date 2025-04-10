import React, {useEffect, useState, useContext} from "react";
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
import {en, fr} from '../../../localization'
import { I18n } from "i18n-js";
import { LanguageContext } from "../../../context/LanguageContext";

// const IssueDetails = ({route}) => {
export default function IssueDetails({ route }) {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    // const route = useRoute();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const {jobId} = route.params;
    let [modalVisible, setModalVisible] = useState(false);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

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
                <ActivityIndicator testID="ActivityIndicator" size="large" color="#ff6600"/>
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

    const updateIssueStatus = async (job, currentStatus) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('You are not logged in');
                return;
            }

            const newStatus = currentStatus.toLowerCase() === 'open' ? 'Closed By Client' : 'Open';
            const actionText = newStatus === 'Closed By Client' ? 'delete' : 'reopen';

            // Show a confirmation popup before proceeding
            Alert.alert(
                i18n.t(`${actionText.toLowerCase()}`), // Use dynamic translation for the title
                `${i18n.t('are_you_sure')} ${i18n.t(`${actionText.toLowerCase()}`)} ${i18n.t('this_issue')}${
                    newStatus === 'Open' ? ' ' + i18n.t('modify_issue_text') : ''
                }`,
                [
                    {
                        text: `${i18n.t('cancel')}`,
                        style: "cancel"
                    },
                    {
                        text: `${i18n.t('yes')}`,
                        onPress: async () => {
                            try {
                                const response = await axios.delete(`https://fixercapstone-production.up.railway.app/issue/updateStatus/${job.id}?status=${newStatus}`,
                                    {headers: {Authorization: `Bearer ${token}`}}
                                );

                                if (response.status === 200 || response.status === 201) {
                                    Alert.alert(`Job ${newStatus === 'Closed By Client' ? 'Deleted' : 'Reopened'} successfully`);
                                    navigation.navigate("JobsPosted");
                                } else {
                                    Alert.alert(`Failed to ${actionText} the job`);
                                }
                            } catch (error) {
                                console.error(`Error updating job status to ${newStatus}:`, error);
                                Alert.alert(`An error occurred while trying to ${actionText} the job`);
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Error handling job status:', error);
            Alert.alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobDetails();
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 50}}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
                <View style={styles.customHeader}>
                    <TouchableOpacity testID="back-button" onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="orange"/>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Issue Details</Text>
                    <NotificationButton onPress={() => navigation.navigate("NotificationPage")}/>
                </View>

                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.detailLabel}>{i18n.t('professional_needed')}</Text>
                <Text style={styles.detailValue}>{job.professionalNeeded || "Not specified"}</Text>

                <Text style={styles.detailLabel}>{i18n.t('status')}</Text>
                <View style={[styles.statusContainer, {
                    backgroundColor: statusStyle.background,
                    borderColor: statusStyle.border
                }]}>
                    <Text style={[styles.statusText, {color: statusStyle.text}]}>
                        {i18n.t(`status_client.${job.status.toLowerCase()}`)}
                    </Text>
                </View>

                {job.professionalEmail && (
                    <View>
                        <Text style={styles.detailLabel}>{i18n.t('assigned_professional')}</Text>
                        <Text style={styles.detailValue}> {job.professionalEmail} </Text>
                    </View>
                )}
                <Text style={styles.detailLabel}>{i18n.t('created_on')}</Text>
                <Text style={styles.detailValue}>
                    {new Date(job.createdAt).toDateString()}{" "}
                    {new Date(job.createdAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
                </Text>

                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{job.description || "No Description"}</Text>


                {job.imageUrl && job.imageUrl !== 'https://via.placeholder.com/150' && job.imageUrl !== null ? (
                    <View style={styles.imageGrid}>
                        <Text style={styles.detailLabel}>Attached Images</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} testID="image-touch">
                            <Image source={{uri: job.imageUrl}} style={styles.jobImage} accessibilityRole="image"/>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.detailLabel}>{i18n.t('attached_images')}</Text>
                        <Text style={styles.detailValue}>{i18n.t('no_image_attached')}</Text>
                    </View>
                )}
                <Modal visible={modalVisible} testID="image-modal" transparent={true} animationType="fade">
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)} testID="modal-close-button">
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
                        <Text style={styles.detailLabel}>{i18n.t('review')}</Text>
                        <Text>
                            <Text style={styles.detailSubLabel}>{i18n.t('rating')}: </Text>
                            <Text style={styles.detailValue}>{job.rating} Stars</Text>
                        </Text>
                        <Text>
                            <Text style={styles.detailSubLabel}>{i18n.t('comment')}: </Text>
                            <Text style={styles.detailValue}>{job.comment || "No comment"}</Text>
                        </Text>

                    </View>
                )}

                {job.status.toLowerCase() === "completed" || job.status.toLowerCase() === "closed" ? (
                    <>
                        <OrangeButton
                            title={i18n.t('add_modify_review')}
                            onPress={() => navigation.navigate("addReview", {jobId})}
                            variant="normal"
                        />
                        <OrangeButton
                            title="Reopen Issue"
                            onPress={() => updateIssueStatus(job, job.status)}
                        />
                    </>
                ) : job.status.toLowerCase() === "open" || job.status.toLowerCase() === "pending" ? (
                    <>
                        <OrangeButton
                            title={i18n.t('modify_issue')}
                            onPress={() => navigation.navigate("EditIssue", {jobId})}
                        />
                        <OrangeButton
                            title={i18n.t('delete_issue')}
                            onPress={() => updateIssueStatus(job, job.status)}
                        />
                    </>
                ) : job.status.toLowerCase() === "in progress" ? (
                        <>
                            <Text style={styles.detailSubLabel}>{i18n.t('jobInProgressComment')} </Text>
                        </>
                ) : null}

            </ScrollView>
        </SafeAreaView>
    );
};
