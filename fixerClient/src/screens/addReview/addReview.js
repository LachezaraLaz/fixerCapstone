import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import axios from 'axios';
import {IPAddress} from "../../../ipAddress";
import { styles } from '../../../style/addReview/addReviewStyle';
import OrangeButton from "../../../components/orangeButton";
import {Ionicons} from "@expo/vector-icons";
import InputField from "../../../components/inputField";
import CustomAlertError from "../../../components/customAlertError";
import CustomAlertSuccess from "../../../components/customAlertSuccess";
import { LanguageContext } from "../../../context/LanguageContext";
import { I18n } from "i18n-js";
import { en, fr } from "../../../localization";

/**
 * @module fixerClient
 */

const AddReview = ({ navigation, route }) => {
    const { jobId } = route.params;

    //For translation
    const { locale } = useContext(LanguageContext);
    const i18n = new I18n({ en, fr });
    i18n.locale = locale;

    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [ratingError, setRatingError] = useState('');

    //For custom alerts
    const [customAlertVisible, setCustomAlertVisible] = useState(false);
    const [customAlertContent, setCustomAlertContent] = useState({ title: '', message: '' });
    const [successAlertVisible, setSuccessAlertVisible] = useState(false);
    const [successAlertContent, setSuccessAlertContent] = useState({ title: '', message: '' });

    /**
     * Handles the submission of a review.
     * 
     * This function validates the rating and comment inputs, sends the review data to the backend,
     * and provides feedback to the user based on the success or failure of the submission.
     * 
     * @async
     * @function handleSubmit
     * @returns {Promise<void>}
     * 
     * @throws Will alert an error message if the rating or comment is missing, if the rating is not a number between 1 and 5,
     *         or if there is an error during the submission process.
     */
    const handleSubmit = async () => {
        if (!rating || !comment) {
            setCustomAlertContent({
                title: i18n.t('error'),
                message: i18n.t('review_incomplete_form'),
            });
            setCustomAlertVisible(true);
            return;
        }

        const isValid = /^[1-5]$/.test(rating);
        if (!isValid) {
            setCustomAlertContent({
                title: i18n.t('error'),
                message: i18n.t('review_rating_error'),
            });
            setCustomAlertVisible(true);
            return;
        }

        try {
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/reviews/add`, {
                jobId,
                rating: parseInt(rating, 10),
                comment,
            });

            if(response.status === 200) {
                setSuccessAlertContent({
                    title: '🎉',
                    message: i18n.t('review_added_successfully'),
                });
                setSuccessAlertVisible(true);
            }
        } catch (error) {
            setCustomAlertContent({
                title: 'Error',
                message: error.response?.data?.message || i18n.t('review_submission_error')
            });
            setCustomAlertVisible(true);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="orange"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('add_modify_review')}</Text>
            </View>

            <View style={styles.container}>
                <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>{i18n.t('rating')}*</Text>
                <InputField
                    style={styles.input}
                    placeholder={i18n.t('review_rating_placeholder')}
                    keyboardType="numeric"
                    value={rating}
                    onChangeText={(text) => {
                        setRating(text);
                        const isValid = /^[1-5]$/.test(text);
                        if (text === '') {
                            setRatingError('');
                        } else if (!isValid) {
                            setRatingError(i18n.t('review_rating_error'));
                        } else {
                            setRatingError('');
                        }
                    }}
                />
                {ratingError !== '' && (
                    <Text style={{ color: 'red', marginBottom: 8, marginLeft: 16 }}>
                        {ratingError}
                    </Text>
                )}


                <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }}>{i18n.t('comment')}*</Text>
                <InputField
                    style={styles.textArea}
                    placeholder={i18n.t('review_comment_placeholder')}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                />

                <OrangeButton title={i18n.t('submit_review')} onPress={handleSubmit}/>

                <CustomAlertError
                    visible={customAlertVisible}
                    title={customAlertContent.title}
                    message={customAlertContent.message}
                    onClose={() => setCustomAlertVisible(false)}
                />

                <CustomAlertSuccess
                    visible={successAlertVisible}
                    title={successAlertContent.title}
                    message={successAlertContent.message}
                    onClose={() => {
                        setSuccessAlertVisible(false);
                        navigation.goBack();
                    }}
                />

            </View>
        </SafeAreaView>
    );
};

export default AddReview;