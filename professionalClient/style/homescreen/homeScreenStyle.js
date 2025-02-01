import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },

    // Explicitly set height for mapContainer to ensure visibility
    mapContainer: {
        height: 350, // Adjust height as needed
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

    //Modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
        justifyContent: 'center', // Center content in the modal
    },

    buttonsContainer: {
        flexDirection: 'row', // Align buttons horizontally
        justifyContent: 'space-between', // Space the buttons apart
        width: '100%', // Make buttons take full width
        marginTop: 12, // Add some space between buttons and input
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalStatus: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 20,
    },
    moreInfoButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flex: 1, // Allow button to take equal space
        marginRight: 7, // Add space between the buttons
    },

    submitButton: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flex: 1, // Allow button to take equal space
        marginLeft: 7, // Add space between the buttons
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    priceInput: {
        width: '70%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 2,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
    },

    // Recenter button in map
    recenterButtonContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 10,
        elevation: 3,
    },
    recenterButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // notification button
    notificationButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        zIndex: 1,
    },

    // profile button
    profileButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        padding: 10,
        zIndex: 1,
    },

    // Search Bar Container
    searchContainer: {
        flexDirection: 'row', // Align children horizontally
        alignItems: 'center', // Vertically center the children
        borderColor: 'gray',
        paddingHorizontal: 10,
        marginLeft: '15%',
        marginRight: '15%',
        zIndex: 1,  // Ensure it appears in front of other elements
        marginBottom: '-5.5%',
        gap: 20, // Add gap between search bar and filter button
    },

    // Search Bar
    searchBar: {
        flex: 1, // Take up remaining space
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },

    // Filter Button
    filterButton: {
    },

    /*
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchBar: {
        flex: 1,
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    searchButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    */
});