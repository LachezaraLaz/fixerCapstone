import {StyleSheet} from "react-native";
import colors from "./colors";

const languageStyle = StyleSheet.create({
    languageButton: {
        position: 'absolute', // Place it over other elements
        top: 20, // Distance from the top
        left: 20, // Distance from the left
        backgroundColor: '#ff8c00', // Orange background
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        elevation: 5, // For Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    languageButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default languageStyle;