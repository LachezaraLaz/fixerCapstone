import React, { useState } from 'react';
import {
    View, TextInput, Text, TouchableOpacity, FlatList, StyleSheet
} from 'react-native';
import colors from '../style/colors';
import { ScrollView } from 'react-native';

const predefinedSuggestions = [
    'Plumber',
    'Electrician',
    'Painter',
    'Carpenter',
    'Mechanic',
    // 'HVAC Technician',
    'Landscaper',
    'Roofer',
    'Handyman',
    'Locksmith',
    // 'Flooring Specialist',
    // 'Drywall Installer',
    'Pest Control Specialist',
    // 'Window Installer',
    'Appliance Repair Technician',
    'General Contractor',
    // 'Mason',
    // 'Welder',
    // 'Tiler',
    // 'Glass Repair Specialist',
    // 'Fence Installer',
    // 'Gutter Cleaner',
    'Pool Technician',
    // 'Garage Door Technician',
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

const styles = StyleSheet.create({
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        backgroundColor: '#fff',
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 14,
        paddingBottom: 14,
    },
    suggestion: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    suggestionText: {
        fontSize: 14,
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        marginBottom: 10,
    },
    badge: {
        flexDirection: 'row',
        backgroundColor: colors.orange.normal,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        marginRight: 6,
        fontWeight: 'bold',
    },
    badgeRemove: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0',
        color: '#999',
    },
});

export default ProfessionalSelector;
