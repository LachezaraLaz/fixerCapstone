import { StyleSheet } from 'react-native';
import colors from "./colors";

const styles = StyleSheet.create({
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        backgroundColor: '#fff',
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 14,
        paddingBottom: 14,
    },
    suggestion: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    suggestionText: {
        fontSize: 14,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        marginBottom: 10,
    },
    badge: {
        flexDirection: 'row',
        backgroundColor: colors.orange.normal,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        marginRight: 6,
        fontWeight: 'bold',
    },
    badgeRemove: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0',
        color: '#999',
    },
});

export default styles;
