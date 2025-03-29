import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8, // Android shadow
    },

    dragHandle: {
        width: 60,
        height: 4,
        backgroundColor: '#ccc',
        alignSelf: 'center',
        borderRadius: 2,
        marginTop: 13,
        marginBottom: 10,
    },


    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 16,
        padding: 8,
        zIndex: 10, // Keep above everything
    },
    content: {
        paddingTop: 30, // Moved content closer to the top
        paddingHorizontal: 20,
        alignItems: 'flex-start', // Align to the top of the modal
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },

    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        marginTop: 20,
    },

    userName: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: '#333',
    },

    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginTop: 19,
    },

    description: {
        fontSize: 14,
        color: '#555',
        marginTop: 7,
        lineHeight: 20,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 5,
    },
    statusTag: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginTop: 15,
    },
    statusOpen: {
        backgroundColor: '#4CAF50', // Green for Open
    },
    statusClosed: {
        backgroundColor: '#E53935', // Red for Closed
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },

    urgencyContentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },

    urgencyContainer: {
        marginVertical: 10,
        backgroundColor: '#fef0e8',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 10,
        marginTop:15
    },

    urgencyText: {
        color: 'red',
        fontWeight: '600',
    },

    headerImage: {
        width: '100%',    // or numeric value, e.g., 300
        height: 245,      // always define height explicitly
        resizeMode: 'contain', // or 'cover' based on your preference
    },

    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseIcon: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 2,
    },
    zoomedImage: {
        width: '100%',
        height: '80%',
    },

    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 100,
        paddingRight: 10,
    },

    locationText: {
        marginLeft: 5,
        color: '#444',
    },


    // Buttons

    bottomButtonsContainer: {
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },

    sendQuoteButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#f28500',
        paddingVertical: 14,
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
    },

    sendQuoteButtonText: {
        color: '#f28500',
        fontWeight: '600',
        fontSize: 16,
    },

    chatButton: {
        flex: 1,
        backgroundColor: '#f28500',
        paddingVertical: 14,
        borderRadius: 8,
        marginLeft: 10,
        alignItems: 'center',
    },

    chatButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },

    disabledSendButton: {
        backgroundColor: '#d84315',
        borderColor: '#d84315',
    },
    disabledChatButton: {
        backgroundColor: '#d84315',
    },
    disabledButtonText: {
        color: '#ffffff',
    },

});