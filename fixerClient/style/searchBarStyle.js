import {Platform, StyleSheet} from "react-native";

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 35,  // Adds space above and below the whole component
        marginHorizontal: 20,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        height: 45,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        textAlign: 'center', // Center text horizontally
        textAlignVertical: 'center', // Works for Android
        ...Platform.select({
            ios: {
                lineHeight: 40, // Aligns text in center on iOS
            },
        }),
        color: '#333'
    },
    iconButton: {
        padding: 8,
    },
    filterButton: {
        marginLeft: 10, // Space between search bar and filter button
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        height: 45,
        width: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
});
export default styles;
