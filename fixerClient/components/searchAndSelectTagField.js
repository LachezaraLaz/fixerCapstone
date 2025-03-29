import React, { useState } from 'react';
import {
    View, TextInput, Text, TouchableOpacity, FlatList, StyleSheet
} from 'react-native';
import { ScrollView } from 'react-native';
import styles from '../style/searchAndSelectTagStyle';

const predefinedSuggestions = [
    'Plumber',
    'Electrician',
    'Painter',
    'Carpenter',
    'Mechanic',
    'Landscaper',
    'Roofer',
    'Handyman',
    'Locksmith',
    'Pest Control Specialist',
    'Appliance Repair Technician',
    'General Contractor',
    'Pool Technician',
];


const ProfessionalSelector = ({ selectedProfessionals, setSelectedProfessionals }) => {
    const [input, setInput] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const handleInputChange = (text) => {
        setInput(text);
        if (text.trim()) {
            const filtered = predefinedSuggestions.filter(item =>
                item.toLowerCase().includes(text.toLowerCase()) &&
                !selectedProfessionals.includes(item)
            );
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions([]);
        }
    };

    const handleSelectSuggestion = (item) => {
        if (selectedProfessionals.length < 2) {
            setSelectedProfessionals([...selectedProfessionals, item]);
            setInput('');
            setFilteredSuggestions([]);
        }
    };

    const removeBadge = (item) => {
        setSelectedProfessionals(selectedProfessionals.filter(pro => pro !== item));
    };

    return (
        <View>
            <TextInput
                placeholder="Type a professional (e.g. Plumber)"
                value={input}
                onChangeText={handleInputChange}
                style={[
                    styles.input,
                    selectedProfessionals.length >= 2 && styles.inputDisabled,
                ]}
                editable={selectedProfessionals.length < 2}
                />


            {/* Suggestions */}
            {filteredSuggestions.length > 0 && selectedProfessionals.length < 2 && (
                <ScrollView style={styles.suggestionList} nestedScrollEnabled={true}>
                    {filteredSuggestions.map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => handleSelectSuggestion(item)}
                        style={styles.suggestion}
                    >
                        <Text style={styles.suggestionText}>{item}</Text>
                    </TouchableOpacity>
                    ))}
                </ScrollView>
            )}


            {/* Badges */}
            <View style={styles.badgeContainer}>
                {selectedProfessionals.map((pro, index) => (
                    <View key={index} style={styles.badge}>
                        <Text style={styles.badgeText}>{pro}</Text>
                        <TouchableOpacity onPress={() => removeBadge(pro)}>
                            <Text style={styles.badgeRemove}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default ProfessionalSelector;
