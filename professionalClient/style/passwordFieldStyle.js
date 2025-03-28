import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    passwordContainer: {
        // flexDirection: 'row',
        // alignItems: 'center',
        position: 'relative', // Ensure the container is relative for absolute positioning of icons
        width: '100%', // Make the container full width
        // marginBottom: 15, // Add margin to match InputField spacing
    },
    passwordInput: {
        flex: 1, // Take up all available space
        paddingRight: 50, // Add padding to prevent text overlap with the eye icon
    },
    eyeIcon: {
        position: 'absolute',
        right: 24,
        top: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 10,
    },
});

export default styles;