import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
        marginRight: '40%', // To have the text "Filters" in the middle of the row
    },
    filterList: {
        padding: 16,
        paddingBottom: 80, // Ensure space for the button
    },
    filterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 35,
    },

    filterButton: {
        width: '25%',  // Adjusting for spacing and margins
        aspectRatio: 1,  // Make it a perfect circle
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#FDF3E6',
        marginBottom: 12,
        backgroundColor: '#FDF3E6',
    },
    filterButtonSelected: {
        backgroundColor: '#f28500',
        borderColor: '#f28500',
    },
    filterButtonText: {
        marginTop: 4,              // Space between icon and text
        fontSize: 10,              // Adjusted font size
        color: '#333',
        textAlign: 'center',       // Center the text
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 20,
    },
    distanceRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    slider: {
        flex: 1,
        marginHorizontal: 16,
    },
    applyButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    applyButton: {
        backgroundColor: '#f28500',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    urgencyContainer: {
        marginBottom: 12,
        zIndex: 1000,
        backgroundColor: 'white',
    },

    urgency: {
        backgroundColor: 'white',
        borderColor: '#ddd',
    },

    starContainer: {
        flexDirection: 'row',
        justifyContent: 'left',
        marginBottom: 36,
    },

});
