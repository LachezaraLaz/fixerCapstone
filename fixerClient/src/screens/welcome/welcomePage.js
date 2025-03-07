import React, { useEffect, useRef } from 'react';
import {View, StyleSheet, Dimensions, Animated } from 'react-native';
import OrangeButton from "../../../components/orangeButton";

const { width, height } = Dimensions.get('window');

// more animation if i have time one day
export default function WelcomePage({ navigation }) {

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
                    Welcome to Fixr!
                </Animated.Text>

                {/* Buttons */}

                {/* <Text style={styles.title}>Welcome to Fixr!</Text> */}
                <OrangeButton title="Sign In" onPress={() => navigation.navigate('SignInPage')} variant="normal" />
                <OrangeButton title="Sign Up" onPress={() => navigation.navigate('SignUpPage')} variant="normal" />
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
