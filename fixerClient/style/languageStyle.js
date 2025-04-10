import {StyleSheet} from "react-native";
import colors from "./colors";

const languageStyle = StyleSheet.create({
    languageButton: {
        position: 'absolute',
        top: 34,
        right: 10,
        padding: 10,
        borderRadius: 5,            // optional for styling
        zIndex: 1000,               // optional to make sure it's on top
        backgroundColor: colors.orange.normal, // Orange background
        paddingVertical: 8,
        paddingHorizontal: 12,
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