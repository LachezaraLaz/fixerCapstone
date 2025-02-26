import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },

    customHeader: {
        width: '100%',
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },

    headerLogo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f28500',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
    },

    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#eee',
        marginBottom: 12,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },

    selectedTab: {
        borderBottomWidth: 4,
        borderBottomColor: '#f28500',
        width: '100%',
    },

    tabText: {
        fontSize: 16,
        color: '#333',
    },

    selectedTabText: {
        color: '#f28500',
        fontWeight: 'bold',
    },

    jobsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },

    jobCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 18,
        marginHorizontal: 0,
        height: 140,
        borderWidth: 2,
        borderColor: '#f0f0f0',
        elevation: 12,
        alignItems: 'center',
        position: 'relative',
    },

    jobImage: {
        width: 100,
        height: 110,
        borderRadius: 5,
        marginRight: 15,
    },

    jobDetails: {
        flex: 1,
    },

    jobTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#333',
    },

    jobLocation: {
        fontSize: 14,
        color: '#777',
        marginBottom: 10,
        marginTop: 10,
    },

    jobRating: {
        fontSize: 14,
        color: '#777',
        marginBottom: 10,
    },

    jobPriceContainer: {
        backgroundColor: '#fde7d1',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 12,
        alignSelf: 'flex-end',
        marginTop: -10,
        marginRight: 2,
    },

    jobPriceText: {
        color: '#f28500',
        fontSize: 16,
        fontWeight: 'bold',
    },

    noJobsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
        marginTop: 20,
    },
});