import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    tab: {
        padding: 10,
        borderBottomWidth: 2,
        borderColor: 'transparent',
    },
    selectedTab: {
        borderColor: 'orange',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    jobsContainer: { padding: 16 },
    jobCard: { backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 8 },
    jobTitle: { fontSize: 16, fontWeight: 'bold' },
    jobDescription: { fontSize: 14, color: '#555' },
    jobPrice: { fontSize: 14, color: '#333', marginTop: 4 },
});
