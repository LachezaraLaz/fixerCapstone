import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
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

    // Explicitly set height for mapContainer to ensure visibility
    mapContainer: {
        height: 200, // Adjust height as needed
        borderRadius: 10,
        overflow: 'hidden',
        margin: 16,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    sectionContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // For Android shadow
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    workBlocks: {
        flexGrow: 1,
        justifyContent: 'space-around',
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    logoutContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 40
    },
    logoutButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
    },
    logoutText: {
        color: '#fff',
        fontSize: 18,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 50,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
    },

    footerText: {
        color: 'white',
        fontSize: 11,
    },

    recenterButtonWrapper: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1,
    },

    recenterButton: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 10,
        elevation: 3,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },

    recenterButtonDenied: {
        backgroundColor: '#eee', // subtle grey to indicate disabled state
    },

    deniedSlash: {
        position: 'absolute',
        width: '120%',
        height: 2,
        backgroundColor: 'red',
        transform: [{ rotate: '-45deg' }],
    },


    // notification button
    notificationButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        zIndex: 1,
    },

    // Search Bar Container
    searchContainer: {
        // flexDirection: 'row', // Align children horizontally
        alignItems: 'center', // Vertically center the children
        borderColor: 'gray',
        paddingHorizontal: 10,
        marginLeft: '70%',
        // marginRight: '15%',
        zIndex: 1,  // Ensure it appears in front of other elements
        marginBottom: '-5.5%',
        gap: 20, // Add gap between search bar and filter button
    },

    // Filter Button
    filterButton: {
        top: 25
    },

    //list issues
    issueCard: {
        // height: 100,
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 14,
        marginVertical: 8,
        // marginHorizontal: 2,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
        alignItems: 'center',
    },
    issueImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 12,
    },
    issueDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    issueTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    issueDescription: {
        fontSize: 13,
        color: '#999',
        marginVertical: 4,
    },
    issueRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    issueRating: {
        fontSize: 13,
        color: '#f1c40f',
        marginLeft: 4,
    },
    issueReviews: {
        fontSize: 12,
        color: '#999',
        marginLeft: 6,
    },
    issuePriceContainer: {
        backgroundColor: '#FEE8D6',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    issuePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f39c12',
    },

    noticeContainer: {
        backgroundColor: '#FFF3E0', // Light orange background
        padding: 12, // Reduced padding
        borderRadius: 10,
        marginVertical: 12, // Reduced margin
        marginHorizontal: 16, // Reduced margin
        flexDirection: 'row', // Arrange icon, text, and button horizontally
        alignItems: 'center', // Center items vertically
        justifyContent: 'space-between', // Distribute space evenly
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },

    noticeIcon: {
        marginRight: 8, // Reduced space between icon and text
    },

    noticeText: {
        fontSize: 14, // Slightly smaller font size
        fontWeight: '500',
        color: '#d84315', // Warning-like color
        flex: 1, // Allow text to take remaining space
        flexShrink: 1, // Ensure text wraps properly
        marginRight: 8, // Space between text and button
    },

    addBankingButton: {
        backgroundColor: '#FF9800', // Vibrant orange
        paddingVertical: 8, // Reduced padding
        paddingHorizontal: 12, // Reduced padding
        borderRadius: 8,
         alignItems: 'center',
        justifyContent: 'center', // Center button text
        minWidth: 120, // Ensure button has a minimum width
    },

    addBankingButtonText: {
        color: '#fff',
        fontSize: 14, // Slightly smaller font size
        fontWeight: 'bold',
    },
});