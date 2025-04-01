import { StyleSheet } from 'react-native';

const reportPageStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F8F8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 8,
    },
    input: {
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#DDD',
        marginBottom: 15,
    },
    descriptionInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    dropdownContainer: {
        marginBottom: 20,
    },
    dropdown: {
        backgroundColor: '#FFF',
        borderColor: '#DDD',
        borderWidth: 1,
        borderRadius: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownList: {
        backgroundColor: '#FFF',
        borderColor: '#DDD',
    },
    submitButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
});

export default reportPageStyles;
