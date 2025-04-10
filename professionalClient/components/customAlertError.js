import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../style/customAlertError/customAlertErrorStyle';

const CustomAlertError = ({ visible, title, message, buttons = [], onClose }) => {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Ionicons name="alert-circle" size={40} color="#FF5C5C" style={{ marginBottom: 10 }} />
                    <Text style={styles.alertTitle}>{title}</Text>
                    <Text style={styles.alertMessage}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {buttons.length > 0
                            ? buttons.map((btn, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.closeButton}
                                    onPress={() => {
                                        onClose?.(); // Close the modal
                                        btn.onPress?.(); // Then do the button action
                                    }}
                                >
                                    <Text style={styles.closeButtonText}>{btn.text}</Text>
                                </TouchableOpacity>
                            ))
                            : (
                                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                    <Text style={styles.closeButtonText}>OK</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlertError;
