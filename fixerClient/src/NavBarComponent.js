import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './homeScreen';
import CreateIssue from './screens/createIssue/createIssue';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function NavBar() {
    return (
        <Tab.Navigator  screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'CreateIssue') {
                    iconName = focused ? 'add' : 'add-outline';
                }

                // Return the appropriate Ionicon
                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',   // Color for active tab
            tabBarInactiveTintColor: 'gray',   // Color for inactive tab
        })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="CreateIssue" component={CreateIssue} />
        </Tab.Navigator>
    );
}
