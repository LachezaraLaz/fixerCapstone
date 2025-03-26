import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4BB543',
        marginBottom: 8,
    },
    alertMessage: {
        fontSize: 15,
        textAlign: 'center',
        color: '#333',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#4BB543',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default styles;