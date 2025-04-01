import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    /* Page Container */
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    headerContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        //paddingBottom: 20,
        backgroundColor: '#fff',
        // borderBottomWidth: 1,
        // borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top:20,
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
        marginTop: 12,
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
        maxWidth: '70%',
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