import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
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
    workBlocksContainer: {
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    workBlocks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    workBlock: {
        backgroundColor: '#f0f0f0',
        width: '48%',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
    },
    workText: {
        fontSize: 16,
        textAlign: 'center',
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
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
});