import * as React from 'react';
import { View, Text, ScrollView } from 'react-native';
import MapView from 'react-native-maps';
import { styles } from '../style/homeScreenStyle';  // Import the styles

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            {/* Map Section */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            </View>

            {/* Work Blocks Section */}
            <View style={styles.workBlocksContainer}>
                <ScrollView contentContainerStyle={styles.workBlocks}>
                    <View style={styles.workBlock}>
                        <Text style={styles.workText}>Electrician 1</Text>
                    </View>
                    <View style={styles.workBlock}>
                        <Text style={styles.workText}>Plumber</Text>
                    </View>
                    <View style={styles.workBlock}>
                        <Text style={styles.workText}>Electrician 2</Text>
                    </View>
                </ScrollView>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Copyright © 2024 Fixr. All rights reserved.
                </Text>
            </View>
        </View>
    );
}
