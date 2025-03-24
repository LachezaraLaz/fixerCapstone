import React, { useContext } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LanguageContext } from "../context/LanguageContext"; // Make sure this path is correct

export default function LanguageModal({ visible, onClose }) {
    const { changeLanguage } = useContext(LanguageContext);

    return (
        <Modal transparent={true} visible={visible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.dragIndicator} />
                    <Text style={styles.title}>🌍 Choose Language</Text>

                    <TouchableOpacity style={styles.button} onPress={() => { changeLanguage("en"); onClose(); }}>
                        <Text style={styles.buttonText}>English</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => { changeLanguage("fr"); onClose(); }}>
                        <Text style={styles.buttonText}>Français</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✖ Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Makes it appear from the bottom
        backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    dragIndicator: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#ccc',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    button: {
        backgroundColor: '#ff8c00',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 10,
    },
    closeButtonText: {
        fontSize: 14,
        color: '#888',
        fontWeight: 'bold',
    },
});
