import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    dropdownContainer: {
        marginHorizontal: 8,
        marginTop: -10,
        borderRadius: 8,
        borderColor: '#ccc',
        width: '100%',
        alignSelf: 'center',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 50,
    },
    dropdownText: {
        fontSize: 14,
    },
    dropdownList: {
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        zIndex: 2000,
    },
    disabledDropdown: {
        opacity: 0.6,
    },
    
});

export default styles;
