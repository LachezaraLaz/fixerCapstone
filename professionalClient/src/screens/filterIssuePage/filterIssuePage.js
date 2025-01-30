import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../../../style/filterIssuePage/filterIssueStyle';


const FilterIssuePage = ({ navigation, route }) => {
    const { typesOfWork, selectedFilters } = route.params;
    const [filters, setFilters] = React.useState(selectedFilters);

    const handleFilterSelect = (type) => {
        if (filters.includes(type)) {
            setFilters(filters.filter((filter) => filter !== type));
        } else {
            setFilters([...filters, type]);
        }
    };

    const handleApplyFilters = () => {
        navigation.navigate('Home', { selectedFilters: filters });
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