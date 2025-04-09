import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // header: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     paddingHorizontal: 16,
    //     paddingVertical: 12,
    //     backgroundColor: '#fff',
    // },
    // backButton: {
    //     width: 40,
    //     height: 40,
    //     borderRadius: 20,
    //     backgroundColor: '#fff',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    //     elevation: 4,
    // },
    // title: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    // },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 0,
        borderBottomColor: '#ddd',
    },
    backButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
        marginLeft: -28, // offset for back button if needed
    },
    grid: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 20,
    },
    card: {
        width: '47%',
        margin: '1.5%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
    },
    cardImage: {
        width: '100%',
        height: 110,
        borderRadius: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },
});

export default styles;