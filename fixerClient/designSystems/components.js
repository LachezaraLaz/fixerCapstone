import * as React from 'react';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    //container
    container: {
        flex: 1,
        padding: 20,
    },
    /* header */
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    /* input field */
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        borderRadius: 5,
        marginBottom: 15,
    },
    imageButton: {
        backgroundColor: '#eee',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginBottom: 15,
    },
    imagePreview: {
        alignItems: 'center',
        marginBottom: 15,
    },
    image: {
        width: 200,
        height: 200,
    },
});

export default styles;
