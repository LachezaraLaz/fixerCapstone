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
        justifyContent: 'space-between',
    },

    filterButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    filterButtonSelected: {
        backgroundColor: '#f28500',
        borderColor: '#f28500',
    },
    filterButtonText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
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
});
