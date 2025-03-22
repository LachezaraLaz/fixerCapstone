import React, { useRef, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
const { width, height } = Dimensions.get('window');


export default function WelcomePage({ navigation }) {
    // Create animated values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Animate on component mount
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
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
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    Welcome to Fixr!
                </Animated.Text>
            </View>
                <TouchableOpacity style={styles.buttonSI} onPress={() => navigation.navigate('SignInPage')}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonSU} onPress={() => navigation.navigate('SignUpPage')}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',  // Align items to the bottom
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingBottom: 100,  // Add padding at the bottom
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    buttonSI: {
        backgroundColor: '#f28500',
        padding: 15,
        borderRadius: 10,
        marginBottom: 30,
        width: '95%',
        alignItems: 'center',
    },
    buttonSU: {
        backgroundColor: '#f28500',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        width: '95%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

