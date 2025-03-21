import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ThankYouPage = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.thankYouText}>Thank you for submitting your credentials!</Text>
            <Button title="Return to Profile" onPress={() => navigation.navigate('Home')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    thankYouText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default ThankYouPage;
