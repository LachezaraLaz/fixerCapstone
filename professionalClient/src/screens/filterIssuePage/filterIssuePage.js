import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../style/filterIssuePage/filterIssueStyle';

const FilterIssuePage = ({ navigation, route }) => {
    const { typesOfWork, selectedFilters, distanceRange: initialDistanceRange } = route.params;
    const [filters, setFilters] = React.useState(selectedFilters);
    const [distanceRange, setDistanceRange] = React.useState(initialDistanceRange || [0, 50]); // Use passed distance range or default

    const handleFilterSelect = (type) => {
        if (filters.includes(type)) {
            setFilters(filters.filter((filter) => filter !== type));
        } else {
            setFilters([...filters, type]);
        }
    };

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
                <TouchableOpacity onPress={handleApplyFilters}>
                    <Text style={styles.applyButton}>Apply</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.filterList}>
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
                        minimumTrackTintColor="orange"
                        maximumTrackTintColor="#ddd"
                    />
                    <Text>{distanceRange[1]} km</Text>
                </View>

                <Text style={styles.sectionTitle}>Types of Work</Text>
                {typesOfWork.map((type, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleFilterSelect(type)}
                        style={[
                            styles.filterButton,
                            filters.includes(type) && styles.filterButtonSelected,
                        ]}
                    >
                        <Text style={styles.filterButtonText}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default FilterIssuePage;