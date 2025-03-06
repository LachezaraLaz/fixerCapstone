import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    globalFont: {
        fontFamily: 'Poppins',
    },

    customHeader: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },

    headerLogo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f28500',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
    },

    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    profileContainer: {
        alignItems: 'center',
        marginTop: 20,
    },

    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#f0f0f0',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },

    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },

    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },

    reviewCountText: {
        fontSize: 16,
        color: '#666',
    },

    descriptionContainer: {
        width: '100%',
        marginTop: 20,
    },

    sectionTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
        marginTop: 20,
    },

    descriptionText: {
        fontSize: 18,
        color: '#555',
        lineHeight: 22,
        textAlign: 'justify',
    },

    reviewsContainer: {
        marginTop: 20,
        width: '100%',
    },

    reviewScrollContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
    },

    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginRight: 10,
        width: 280,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },

    reviewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    reviewerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#fef3e6',
    },

    reviewerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },

    reviewerLocation: {
        fontSize: 14,
        color: '#777',
    },

    reviewText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
        lineHeight: 20,
    },

    reviewRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },

    starContainer: {
        flexDirection: 'row',
        marginRight: 5,
    },

    ratingText: {
        fontSize: 16,
        color: '#FFD700',
        marginRight: 2,
    },

    ratingNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginRight: 10,
    },

    reviewDate: {
        fontSize: 12,
        color: '#888',
    },

    noReviewsText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
    },


    reviewCountLink: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#F28500',
        marginLeft: 5,
        marginTop: 10,
    },

    reviewCardsContainer: {
        marginTop: 10,
    },

    emailContainer: {
        width: '100%',
        marginTop: 20,
    },
    emailLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    emailText: {
        fontSize: 16,
        color: '#666',
        backgroundColor: '#f5f5f5',
        padding: 20,
        borderRadius: 10,
        marginTop: 6,
    },

    sectionContainer: {
        marginTop: 15,
        width: '100%',
    },

    inputBox: {
        fontSize: 16,
        color: '#666',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
        marginTop: 6,
    },

    verifyButton: {
        backgroundColor: '#F28500',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 15,
        width: '100%',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewsButton: {
        backgroundColor: '#f28500',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    reviewsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    certificatesContainer: {
        marginTop: 20,
        width: '100%',
    },

    certificateItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },

    certificateTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Poppins',
    },

    certificateSubText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins',
    },

    issuedDate: {
        fontSize: 14,
        color: '#777',
        fontFamily: 'Poppins',
    },

    noCertificatesText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'Poppins',
    },

});
