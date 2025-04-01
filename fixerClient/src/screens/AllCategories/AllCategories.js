import React from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationButton from '../../../components/notificationButton';
import styles from '../../../style/allCategoriesStyle';


const categories = [
    {
        id: '1',
        name: 'Plumbing',
        image: require('../homeScreen/CategoriesIMGs/Plumber_IMG.png'),
    },
    {
        id: '2',
        name: 'Cleaning',
        image: require('../homeScreen/CategoriesIMGs/Cleaner_IMG.png'),
    },
    {
        id: '3',
        name: 'Electrical',
        image: require('../homeScreen/CategoriesIMGs/Electrician_IMG.png'),
    },
];

export default function AllCategories({ navigation }) {
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{item.name}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Categories</Text>
                <NotificationButton onPress={() => navigation.navigate('NotificationPage')} />
            </View>

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}