import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    button: {
        padding: 14,
        borderRadius: 8,
        flex: 0,
        justifyContent: 'center',
        minWidth: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        shadowRadius: 4,
        elevation: 5,
        margin: 8,
        marginTop: 20,
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledText: {
        color: '#a0a0a0', // Light gray color for disabled text
    },
});

export default styles;