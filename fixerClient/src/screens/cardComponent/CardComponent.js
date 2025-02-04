import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function CardComponent({ title, status, professionalName, showProgress = true, showProfessional = true, imageUri }) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={[styles.status, status === 'Overdue' ? styles.overdue : styles.inProgress]}>{status}</Text>
            </View>
            {showProfessional && (
                <View style={styles.details}>
                    <Text style={styles.professionalName}>By: {professionalName}</Text>
                    {imageUri && <Image style={styles.image} source={{ uri: imageUri }} />}
                </View>
            )}
            {showProgress && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Open</Text>
                    <Text style={styles.progressText}>Quote</Text>
                    <Text style={styles.progressText}>Accept</Text>
                    <Text style={styles.progressText}>Doing</Text>
                    <Text style={styles.progressText}>Finish</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    status: {
        fontSize: 14,
    },
    overdue: {
        color: 'red',
    },
    inProgress: {
        color: 'green',
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    professionalName: {
        fontSize: 14,
        color: '#333',
        marginRight: 8,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    progressText: {
        fontSize: 12,
        color: '#555',
    },
});
