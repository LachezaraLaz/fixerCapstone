import {StyleSheet} from "react-native";

const languageModalStyle = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Slide from bottom
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    button: {
        backgroundColor: '#ff8c00',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 10,
    },
    closeButtonText: {
        fontSize: 14,
        color: '#888',
        fontWeight: 'bold',
    },
});

export default languageModalStyle;
