import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import colors from '../style/colors'; 
import styles from '../style/inputFieldStyle'; 
import dropdownStyles from '../style/dropdownStyle';

const Dropdown = ({
    placeholder,
    items,
    onValueChange,
    value,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false); // State to manage dropdown visibility
    const [selectedValue, setSelectedValue] = useState(value); // State to manage selected value

    // Handle item selection
    const handleSelect = (item) => {
        setSelectedValue(item.value); // Update selected value
        onValueChange(item.value); // Pass selected value to parent
        setIsOpen(false); // Close the dropdown
    };

    // Determine border color based on focus
    const borderColor = isOpen ? colors.orange.normal : '#ccc';

    return (
        <View style={[styles.inputContainer, { borderColor }]}>
            {/* Floating Label (Placeholder) */}
            {selectedValue && (
                <Text style={[styles.floatingLabel, disabled && styles.disabledText]}>
                    {placeholder}
                </Text>
            )}

            {/* Dropdown Trigger */}
            <TouchableOpacity
                style={dropdownStyles.trigger}
                onPress={() => !disabled && setIsOpen(!isOpen)} // Toggle dropdown
                disabled={disabled}
            >
                <Text style={dropdownStyles.selectedText}>
                    {items.find((item) => item.value === selectedValue)?.label || placeholder}
                </Text>
                <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={disabled ? '#888' : '#000'}
                />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {isOpen && (
                <View style={dropdownStyles.menu}>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={dropdownStyles.menuItem}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={dropdownStyles.menuItemText}>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

export default Dropdown;
