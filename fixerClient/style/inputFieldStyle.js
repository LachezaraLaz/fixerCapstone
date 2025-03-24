import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    inputContainer: {
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 5,
        paddingBottom: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        alignSelf: 'center',
        margin: 8,
        backgroundColor: '#fff',
        position: 'relative', // Needed for floating label positioning
    },
    input: {
        fontSize: 16,
        color: '#000',
        paddingTop: 10, // Add padding to prevent text overlap with floating label
    },
    floatingLabel: {
        position: 'absolute', // Position the label absolutely
        top: -10, // Move the label above the input field
        left: 10, // Align the label to the left
        backgroundColor: '#fff', // Match the background color of the input container
        paddingHorizontal: 4, // Add padding to prevent overlap with the border
        fontSize: 12, // Smaller font size for the floating label
        color: '#888', // Gray color for the floating label
        borderRadius: 10,
    },
    // Disabled styles
    disabledInputContainer: {
        backgroundColor: '#f0f0f0', // Light gray background for disabled state
        borderColor: '#f0f0f0', // Remove border for disabled state
    },
    disabledInput: {
        color: '#888', // Muted text color for disabled state
    },
    disabledText: {
        color: '#888', // Muted text color for disabled floating label
    },
    // Multiline styles
    multilineInput: {
        minHeight: 100,
        maxHeight: 175, // You can tweak this
        textAlignVertical: 'top', // Makes text start from top in multiline fields
    },
});

export default styles;