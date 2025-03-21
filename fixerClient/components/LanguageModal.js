import React, { useContext } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LanguageContext } from "../context/LanguageContext"; // Import Context

export default function LanguageModal({ visible, onClose }) {
    const { changeLanguage } = useContext(LanguageContext);

    return (
        <Modal transparent={true} visible={visible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Choose Language</Text>
                    <TouchableOpacity onPress={() => { changeLanguage("en"); onClose(); }}>
                        <Text> English</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { changeLanguage("fr"); onClose(); }}>
                        <Text> Français</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose}>
                        <Text>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});




// import React from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import languageModalStyle from "../style/languageModalStyle";
//
// export default function LanguageModal({ visible, onClose, setLocale }) {
//     return (
//         <Modal transparent={true} visible={visible} animationType="slide">
//             <View style={languageModalStyle.modalContainer}>
//                 <View style={languageModalStyle.modalContent}>
//                     <Text style={languageModalStyle.title}>🌍 Choose Language</Text>
//
//                     <TouchableOpacity style={languageModalStyle.button} onPress={() => { setLocale("en"); onClose(); }}>
//                         <Text style={languageModalStyle.buttonText}>English</Text>
//                     </TouchableOpacity>
//
//                     <TouchableOpacity style={languageModalStyle.button} onPress={() => { setLocale("fr"); onClose(); }}>
//                         <Text style={languageModalStyle.buttonText}>Français</Text>
//                     </TouchableOpacity>
//
//                     <TouchableOpacity style={languageModalStyle.closeButton} onPress={onClose}>
//                         <Text style={languageModalStyle.closeButtonText}>✖ Close</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </Modal>
//     );
// }
