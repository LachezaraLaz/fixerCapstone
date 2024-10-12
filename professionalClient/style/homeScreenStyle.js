import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    mapContainer: {
        flex: 1, // Map takes half of the screen height
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    workBlocksContainer: {
        flex: 1, // Work blocks take the other half
        backgroundColor: '#f1f1f1',
        padding: 10,
    },
    workBlocks: {
        flexGrow: 1,
        justifyContent: 'space-around',
    },
    workBlock: {
        height: 80,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 8,
    },
    workText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        height: 50,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: 'white',
        fontSize: 12,
    },
});
