import * as React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Professional Home Screen</Text>
            <Button
                title="Go to Details"
                onPress={() => navigation.navigate('Details')}
            />

            <Button
                title="Go to Profile Page"
                onPress={() => navigation.navigate('ProfilePage')}
            />

        </View>
    );
}
