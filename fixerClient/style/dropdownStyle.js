import { StyleSheet } from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
    dropdownContainer: {
        // marginVertical: 8,
        marginHorizontal: 8,
        // zIndex: 1000,
        borderRadius: 8,
        // borderWidth: 0,
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
