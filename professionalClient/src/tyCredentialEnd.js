import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ThankYouPage = () => {
    const navigation = useNavigation();

    return (
        <View>
            <Text>Thank you for submitting your credentials!</Text>
            <Button title="Return to Profile" onPress={() => navigation.navigate('HomeScreen')} />
        </View>
    );
};

export default ThankYouPage;
