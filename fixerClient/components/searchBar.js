import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../style/searchBarStyle';

const SearchBar = ({testID, filterButtonTestID, onSearch, onFilter, onSearchChange,}) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (text) => {
        setQuery(text);
        if (onSearchChange) {
            onSearchChange(text);
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Find services or professionals"
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={handleInputChange}
                />
                <TouchableOpacity testID={testID} style={styles.iconButton} onPress={() => onSearch?.(query)}>
                    <Ionicons name="search" size={20} color="#666" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity testID={filterButtonTestID} style={styles.filterButton} onPress={onFilter}>
                <Ionicons name="filter" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    );
};

export default SearchBar;
