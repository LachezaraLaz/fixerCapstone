import { StyleSheet } from "react-native";

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
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    headerButton: {
        padding: 8,
    },
    jobTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        marginTop: 20,
        color: "#333",
    },
    detailLabel: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 20,
        color: "#333",
    },
    detailValue: {
        fontSize: 16,
        color: "#555",
    },
    statusOpen: {
        color: "#28a745",
        fontWeight: "bold",
    },
    statusClosed: {
        color: "#ff4d4d",
        fontWeight: "bold",
    },
    map: {
        width: "100%",
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    noLocationText: {
        textAlign: "center",
        color: "#999",
        fontSize: 16,
        fontStyle: "italic",
        marginBottom: 10,
    },
    jobImage: {
        width: "100%",
        height: 250,
        resizeMode: "contain",
        marginBottom: 10,
        marginRight: 15,
    },
    smallImage: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        resizeMode: "contain",
        marginBottom: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCloseButton: {
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 1,
    },
    fullImage: {
        width: "90%",
        height: "80%",
        resizeMode: "contain",
    },
    statusContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        alignSelf: "flex-start",
        marginTop: 5,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "bold",
        textTransform: "capitalize",
    },
    redirectButton:{
        padding: 20,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        minWidth: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        shadowRadius: 4,
        elevation: 5,
        marginTop: 20,
        marginBottom: 20,
    }

});
