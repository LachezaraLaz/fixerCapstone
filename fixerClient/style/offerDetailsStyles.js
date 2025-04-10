import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loader: {
        marginTop: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 6,
    },
    sectionValue: {
        fontSize: 15,
        color: '#444',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F28C28',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    rejectButton: {
        flex: 1,
        marginRight: 10,
        borderColor: '#F28C28',
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    rejectText: {
        color: '#F28C28',
        fontSize: 16,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        marginLeft: 10,
        backgroundColor: '#F28C28',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    acceptText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        color: '#666',
    },
});

export default styles;
