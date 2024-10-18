import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function WelcomePage({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hey this is Professional Fixer!</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignInPage')}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUpPage')}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

