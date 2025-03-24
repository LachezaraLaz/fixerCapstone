import { Platform, StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width; // Get full screen width
const SEARCH_BAR_WIDTH = SCREEN_WIDTH - 32; // Ensures it matches the orange section (with margins)

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: SEARCH_BAR_WIDTH,
        alignSelf: "center",
        marginVertical: 10,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        height: 50,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },

    input: {
        flex: 1,
        fontSize: 16,
        textAlign: 'left',
        paddingVertical: 14,
        color: '#333',
        ...Platform.select({
            ios: {
                lineHeight: 22,
            },
            android: {
                paddingTop: 0,
                paddingBottom: 0,
            },
        }),
    },

    iconButton: {
        padding: 12,
    },

    filterButton: {
        marginLeft: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 55,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default styles;
