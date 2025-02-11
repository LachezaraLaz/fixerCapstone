import React from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../style/searchBarStyle'; // Import styles from external file

const SearchBar = ({ onSearch, onFilter }) => {
    return (
        <View style={styles.wrapper}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Find services or professionals"
                    placeholderTextColor="#999"
                />
                {/* Search Button */}
                <TouchableOpacity style={styles.iconButton} onPress={onSearch}>
                    <Ionicons name="search" size={20} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Separate Filter Button */}
            <TouchableOpacity style={styles.filterButton} onPress={onFilter}>
                <Ionicons name="filter" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    );
};

export default SearchBar;
