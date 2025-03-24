import * as React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../style/filterIssuePage/filterIssueStyle';
// import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';

/**
 * @module professionalClient
 */

const FilterIssuePage = ({ navigation, route }) => {
    const { typesOfWork, selectedFilters, distanceRange: initialDistanceRange } = route.params;
    const [filters, setFilters] = React.useState(selectedFilters);
    const [distanceRange, setDistanceRange] = React.useState(initialDistanceRange || [0, 50]);
    const [rating, setRating] = useState(0);
    const [timeline, setTimeline] = useState('');
    const urgencyOptions = ['high-Priority', 'low-Priority'];

    /**
     * Handles the selection of a filter type. If the filter type is already selected, it removes it from the filters.
     * Otherwise, it adds the filter type to the filters.
     *
     * @param {string} type - The filter type to be selected or deselected.
     */
    const handleFilterSelect = (type) => {
        if (filters.includes(type)) {
            setFilters(filters.filter((filter) => filter !== type));
        } else {
            setFilters([...filters, type]);
        }
    };

    /**
     * Navigates to the 'Home' screen with the selected filters and distance range.
     *
     * @function handleApplyFilters
     * @returns {void}
     */
    const handleApplyFilters = () => {
        navigation.replace('Home', {
            selectedFilters: filters,
            distanceRange,
            rating,
            timeline,
        });
    };

    const handleRatingSelect = (value) => {
        setRating(value === rating ? 0 : value);
    };

    const calculateFilterCount = () => {
        let count = filters.length;
        if (distanceRange[1] !== 50) count++;
        if (rating > 0) count++;
        if (timeline) count++;
        return count;
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Filters</Text>
            </View>

            <ScrollView contentContainerStyle={styles.filterList}>
                <View style={styles.filterGrid}>
                    {typesOfWork.map((type, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleFilterSelect(type)}
                            style={[styles.filterButton, filters.includes(type) && styles.filterButtonSelected]}
                        >
                            <Ionicons name="construct" size={40} color={filters.includes(type) ? '#fff' : '#f28500'} />
                            <Text style={[styles.filterButtonText, filters.includes(type) && { color: '#fff' }]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>


                <Text style={styles.sectionTitle}>Distance Range (km)</Text>
                <View style={styles.distanceRangeContainer}>
                    <Text>{distanceRange[0]} km</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        value={distanceRange[1]}
                        onValueChange={(value) => setDistanceRange([distanceRange[0], value])}
                        minimumTrackTintColor="#f28500"
                        maximumTrackTintColor="#ddd"
                        thumbTintColor="#f28500"
                    />
                    <Text>{distanceRange[1]} km</Text>
                </View>


                <Text style={styles.sectionTitle}>Urgency Timeline</Text>
                <View style={styles.urgencyContainer}>
                    <RNPickerSelect
                        onValueChange={(value) => setTimeline(value)}
                        items={urgencyOptions.map((option) => ({
                            label: option,
                            value: option,
                        }))}
                        placeholder={{ label: 'Select', value: null }}
                        style={{
                            inputIOS: {
                                height: 40,
                                padding: 10,
                                borderRadius: 8,
                                color: '#333',
                            },
                            inputAndroid: {
                                height: 55,
                                padding: 10,
                                borderRadius: 8,
                                color: '#333',
                            },
                        }}
                    />
                </View>


                <Text style={styles.sectionTitle}>Rating</Text>
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => handleRatingSelect(star)}>
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={24}
                                color={star <= rating ? "#f28500" : "#ddd"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <View style={styles.applyButtonContainer}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                    <Text style={styles.applyButtonText}>Apply The Filter ({calculateFilterCount()})</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FilterIssuePage;
