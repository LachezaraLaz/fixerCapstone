import { StyleSheet } from 'react-native';

const dropdownStyles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingLeft: 4,
        paddingRight: 14,
        paddingTop: 10,
        paddingBottom: 4,
    },
    selectedText: {
        fontSize: 16,
        color: '#000',
    },
    menu: {
        marginTop: 10,
        marginRight: 14,
        alignContent: "center",
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        maxHeight: 200, // Limit the height of the dropdown menu
        overflow: 'hidden', // Ensure the menu doesn't overflow
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemText: {
        fontSize: 16,
        color: '#000',
    },
});

export default dropdownStyles;