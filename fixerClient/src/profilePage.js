import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const ProfilePage = () => {
    // Hardcoded professional data
    const professional = {
        name: 'Thaneekan Thankarajah',
        email: 'thaneekan@example.com',
        profilePicture: require('../assets/profile.jpg'),
        rating: 4.9,
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Profile Picture */}
                <Image source={professional.profilePicture} style={styles.profileImage} />

                {/* Name and Rating */}
                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{professional.name}</Text>
                    <Text style={styles.ratingText}>⭐ {professional.rating}</Text>
                </View>

                {/* Email */}
                <Text style={styles.emailText}>{professional.email}</Text>
            </View>

            {/* Help Button */}
            <View style={styles.section}>
                <Text style={styles.sectionText}>Help</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50, // Makes the image circular
        marginBottom: 16,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 18,
        color: '#FFD700',
    },
    emailText: {
        fontSize: 16,
        color: '#666666',
    },
    section: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    sectionText: {
        fontSize: 18,
        color: '#333333',
    },
});

export default ProfilePage;
