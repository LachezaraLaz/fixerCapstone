import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../style/customAlertError/customAlertErrorStyle';

const CustomAlertError = ({ visible, title, message, onClose, onConfirm, confirmText = 'OK', cancelText = null }) => {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Ionicons name="alert-circle" size={40} color="#FF5C5C" style={{ marginBottom: 10 }} />
                    <Text style={styles.alertTitle}>{title}</Text>
                    <Text style={styles.alertMessage}>{message}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                        {cancelText && (
                            <TouchableOpacity style={[styles.closeButton, { marginRight: 10 }]} onPress={onClose}>
                                <Text style={styles.closeButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.closeButton} onPress={onConfirm || onClose}>
                            <Text style={styles.closeButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlertError;
