import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff'
    },

    containerTitle: {
        textAlign: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        marginVertical: 8
    },

    labelPrice: {
        fontSize: 13.8,
        fontWeight: '600',
        marginVertical: 8
    },

    inputContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        height: 150,
        textAlignVertical: 'top', // Align placeholder at the top
    },


    input:{
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        height: 50,
    },

    timePicker: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10
    },

    submitButton: {
        backgroundColor: '#f28500',
        padding: 15, alignItems: 'center',
        borderRadius: 5,
        marginTop: 15,
    },

    submitButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },

});