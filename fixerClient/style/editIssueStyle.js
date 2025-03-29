import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    text: {
        color: "orange",
        fontSize: 16,
        fontWeight: "bold"
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    removeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'orange',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeText: {
        fontSize: 12,
        color: 'orange',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop: 14,
    },
    uploadBox: {
        width: 300,
        height: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        marginBottom: 10,
        tintColor: '#667085',
    },
    supportedFormats: {
        fontSize: 12,
        color: '#667085',
        marginTop: 5,
    },
    pickerContainer: {
        borderRadius: 8,
        marginTop: 20,
    },
    aiEnhanceButton: {
        position: 'absolute',
        bottom: 30,
        right: 15,
        backgroundColor: '#ff8c00',
        borderRadius: 50,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    headerContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        left: 4,
        top:0,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    badgeInfo: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        marginLeft: 8,
        marginTop: -10,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },

    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },

});

export default styles;
