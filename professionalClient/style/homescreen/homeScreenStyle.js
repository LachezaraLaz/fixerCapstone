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

    // Recenter button in map
    recenterButtonContainer: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 10,
        elevation: 3,
        zIndex: 1,
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

});