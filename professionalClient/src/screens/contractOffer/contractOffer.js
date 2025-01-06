import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

export default function ContractOffer({ route, navigation }) {
    const { issue } = route.params;
    const [price, setPrice] = React.useState('');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{issue.title}</Text>
            <Text style={styles.subtitle}>Detailed Information</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{issue.description}</Text>

                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{issue.status}</Text>

                <Text style={styles.label}>Professional Needed:</Text>
                <Text style={styles.value}>{issue.professionalNeeded}</Text>

                {issue.address && (
                    <>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.value}>{issue.address}</Text>
                    </>
                )}

                <Text style={styles.label}>Coordinates:</Text>
                <Text style={styles.value}>
                    Latitude: {issue.latitude}, Longitude: {issue.longitude}
                </Text>
            </View>

            {/* Additional Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Job Requirements</Text>
                <Text style={styles.sectionContent}>
                    {issue.requirements || 'No specific requirements provided for this job.'}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fee</Text>
                <TextInput
                    placeholder="Enter price for this issue"
                    value={price}
                    keyboardType="numeric"
                    onChangeText={setPrice}
                    style={styles.input}
                />
            </View>

            {/* Placeholder for Images/Documents */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Related Images/Documents</Text>
                <Text style={styles.sectionContent}>No attachments provided for this issue.</Text>
            </View>

            {/* Go Back Button */}
            <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f9f9f9',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#555',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    value: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    section: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    sectionContent: {
        fontSize: 14,
        color: '#666',
    },
    goBackButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    input:{
        width: '70%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 2,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
});