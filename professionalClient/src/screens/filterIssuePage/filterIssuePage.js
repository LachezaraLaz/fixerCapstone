import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../style/filterIssuePage/filterIssueStyle';

/**
 * @module professionalClient
 */

const FilterIssuePage = ({ navigation, route }) => {
    const { typesOfWork, selectedFilters, distanceRange: initialDistanceRange } = route.params;
    const [filters, setFilters] = React.useState(selectedFilters);
    const [distanceRange, setDistanceRange] = React.useState(initialDistanceRange || [0, 50]);

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
        navigation.navigate('Home', { selectedFilters: filters, distanceRange });
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
                            <Ionicons name="construct" size={24} color={filters.includes(type) ? '#fff' : '#f28500'} />
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
                        onValueChange={(value) => setDistanceRange([0, value])}
                        minimumTrackTintColor="#f28500"
                        maximumTrackTintColor="#ddd"
                    />
                    <Text>{distanceRange[1]} km</Text>
                </View>



                {/*<Text style={styles.sectionTitle}>Budget Range</Text>*/}
                {/*<View style={styles.distanceRangeContainer}>*/}
                {/*    <Text>${distanceRange[0]}</Text>*/}
                {/*    <Slider*/}
                {/*        style={styles.slider}*/}
                {/*        minimumValue={5}*/}
                {/*        maximumValue={1000}*/}
                {/*        step={1}*/}
                {/*        value={distanceRange[1]}*/}
                {/*        onValueChange={(value) => setDistanceRange([5, value])}*/}
                {/*        minimumTrackTintColor="orange"*/}
                {/*        maximumTrackTintColor="#ddd"*/}
                {/*    />*/}
                {/*    <Text>${distanceRange[1]}</Text>*/}
                {/*</View>*/}

            </ScrollView>
            <View style={styles.applyButtonContainer}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                    <Text style={styles.applyButtonText}>Apply The Filter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FilterIssuePage;
