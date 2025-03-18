import React, {useContext, useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Dimensions, Animated, Button, TouchableOpacity, Text} from 'react-native';
import OrangeButton from "../../../components/orangeButton";
import {en, fr} from '../../../localization'
import * as Localization from 'expo-localization'
import { I18n } from "i18n-js";
import LanguageModal from "../../../components/LanguageModal";
import languageStyle from '../../../style/languageStyle';
import {LanguageContext} from "../../../context/LanguageContext";

const { width, height } = Dimensions.get('window');

// more animation if i have time one day
export default function WelcomePage({ navigation }) {
    let [modalVisible, setModalVisible] = useState(false);

    console.log("Current language is " + Localization.getLocales()[0].languageCode);
    const {locale, setLocale}  = useContext(LanguageContext);
    const i18n = new I18n(en,fr);
    i18n.fallbacks = true;
    i18n.translations = {en,fr}
    i18n.locale = locale;
        // Create animated values
        const fadeAnim = useRef(new Animated.Value(0)).current; // Start with opacity 0
        const slideAnim = useRef(new Animated.Value(30)).current; // Start 30 units below
    
        useEffect(() => {
            // Animate on component mount
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1, // Fade in to full opacity
                    duration: 1000, // 1 second
                    useNativeDriver: true, // Use native driver for better performance
                }),
                Animated.timing(slideAnim, {
                    toValue: 0, // Slide up to original position
                    duration: 1000, // 1 second
                    useNativeDriver: true,
                }),
            ]).start();
        }, [fadeAnim, slideAnim]);


    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={languageStyle.languageButton}>
                <Text style={languageStyle.languageButtonText}>🌍 Change Language</Text>
            </TouchableOpacity>

            <LanguageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                setLocale={setLocale}
            />
            <View style={styles.content}>
                 {/* Animated Title */}
                 <Animated.Text
                    style={[
                        styles.title,
                        {
                            opacity: fadeAnim, // Bind opacity to animated value
                            transform: [{ translateY: slideAnim }], // Bind translateY to animated value
                        },
                    ]}
                >
                     {i18n.t('welcome')} Fixr!
                </Animated.Text>

                {/* Buttons */}

                {/* <Text style={styles.title}>Welcome to Fixr!</Text> */}
                <OrangeButton title={i18n.t('sign_in')} onPress={() => navigation.navigate('SignInPage')} variant="normal" />
                <OrangeButton title={i18n.t('sign_up')} onPress={() => navigation.navigate('SignUpPage')} variant="normal" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',  // Align items to the bottom
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingBottom: 60,  // Add padding at the bottom
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        marginBottom: 10,
    },
});
