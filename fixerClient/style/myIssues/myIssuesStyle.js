import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    /** ✅ Safe Area **/
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },

    /** ✅ Custom Header **/
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
        color: 'orange',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
    },

    /** ✅ Tabs Styling (Ensure Equal Padding) **/
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,  // ✅ Ensures equal spacing from both sides
        paddingVertical: 10,  // ✅ Consistent padding for top & bottom
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },

    /** ✅ Jobs Container **/
    jobsContainer: {
        flex: 1,
        paddingHorizontal: 16, // ✅ Ensures equal padding for job list
    },

    /** ✅ Job Card (Equal Padding on All Sides) **/
    jobCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20, // ✅ Ensures equal padding on all sides
        marginBottom: 18,
        marginHorizontal: 0, // ✅ Ensures alignment inside `jobsContainer`
        height: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
        position: 'relative',
    },

    /** ✅ Job Image **/
    jobImage: {
        width: 85,
        height: 85,
        borderRadius: 12,
        marginRight: 15,
    },

    /** ✅ Job Details **/
    jobDetails: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    jobLocation: {
        fontSize: 14,
        color: '#777',
        marginBottom: 8,
    },
    jobRating: {
        fontSize: 14,
        color: '#777',
        marginBottom: 10,
    },

    /** ✅ Price Section **/
    jobPriceContainer: {
        backgroundColor: '#fde7d1',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 12,
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    jobPriceText: {
        color: '#f28500',
        fontSize: 16,
        fontWeight: 'bold',
    },

    /** ✅ No Jobs Available Message **/
    noJobsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
        marginTop: 20,
    },
});
