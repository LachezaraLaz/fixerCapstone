import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    /* Page Container */
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },

    /* Header */
    customHeader: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
    },
    headerLogo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'orange',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },

    /* Hero/Greeting */
    heroContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFA500',
        padding: 20,
        borderRadius: 12,
        marginHorizontal: 16,
        alignItems: 'center',
        marginTop: 0,
    },
    heroImage: {
        width: 134,
        height: 147,
        resizeMode: 'contain',
        position: 'absolute',
        right: 10, // Aligns it to the right edge
        top: -17, // Bottom Alignement with orange section
    },

    heroImagePlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 12,
        resizeMode: 'cover',
        marginRight: 12,
        backgroundColor: '#DDD',
    },
    heroPlaceholderText: {
        color: '#fff',
        fontWeight: '600',
    },
    heroTextContainer: {
        flex: 1,
        paddingLeft: 10,
        justifyContent: 'center',
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        lineHeight: 30,
    },
    heroSubtitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        lineHeight: 30,
    },

    /* SearchBar */
    searchBarWrapper: {
        paddingHorizontal: 16,
        marginTop: 6,
        marginBottom: 6,
    },

    /* Create New Job Button */
    createJobContainer: {
        marginTop: 0,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    createJobButton: {
        width: '100%',
        marginBottom: 12,
    },
    createJobButtonInner: {
        width: '100%',
        height: 70,
        backgroundColor: '#FFA500',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    createJobButtonText: {
        fontSize: 20,
        fontWeight: '600', // Slightly bolder than normal
        color: '#FFF',
    },

    /* Categories Section Styling */
    categoriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    categoriesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    viewAllText: {
        fontSize: 14,
        color: '#FFA500',
        fontWeight: '600', // Slightly bolder than normal
    },
    categoriesScroll: {
        height: 210,
        marginBottom: 12,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 16,
        width: 136,
    },
    categoryImage: {
        width: 136, // Figma dimension
        height: 183, // Figma dimension
        borderRadius: 12, // Rounded corners
        backgroundColor: '#EEE',
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginTop: 6,
    },

    /* Requests Section */
    requestsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    requestsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    requestsContainer: {
        paddingHorizontal: 16,
    },

    /* Request Card Container */
    requestCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EEE',
    },

    /* The request image on the left */
    requestUserImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        backgroundColor: '#EEE',
    },

    /* The column on the right holding all text & buttons */
    requestContent: {
        flex: 1,
        justifyContent: 'center',
    },

    /* Name and Rating */
    requestTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },

    requestUserName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        maxWidth: '70%', // so text doesn't collide with rating
    },

    requestRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#FFA500',
    },

    /* Address row with location icon */
    requestAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 5,
    },

    requestAddress: {
        fontSize: 14,
        color: '#666',
    },

    requestJob: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
        marginBottom: 5,
    },

    /* Buttons row at the bottom */
    requestButtonsRow: {
        flexDirection: 'row',
        marginTop: 5,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FFA500',
        paddingVertical: 10,
        borderRadius: 6,
        marginRight: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectText: {
        color: '#FFA500',
        fontSize: 14,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#FFA500',
        paddingVertical: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },

    /* Logout Button */
    logoutContainer: {
        marginTop: 10,
        paddingHorizontal: 16,
    },
    logoutButton: {
        backgroundColor: '#ffdddd',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#d9534f',
        fontWeight: 'bold',
    },

    /* Date */
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    date: {
        fontSize: 12,
        color: '#333',
    },

});
export default styles;
