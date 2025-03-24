import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    button: {
        padding: 14,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        minWidth: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        shadowRadius: 4,
        elevation: 5,
        marginTop: 50,
    },
    text: {
        color: "orange",
        fontSize: 16,
        fontWeight: "bold"
    },
    mapContainer: {
        flex: 1,
        marginTop: 40,
    },
    map: {
        width: 361,
        height: 222,
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
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 45,
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
    textPlaceholder: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F79009',
    },
    supportedFormats: {
        fontSize: 12,
        color: '#667085',
        marginTop: 5,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    pickerContainer: {
        borderRadius: 8,
        marginTop: 20,
    },
    aiEnhanceButton: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: '#ff8c00',
        borderRadius: 50,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    footer: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        marginTop: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#666',
    },
});

export default styles;
