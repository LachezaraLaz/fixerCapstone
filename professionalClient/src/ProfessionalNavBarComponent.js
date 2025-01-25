import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, TouchableOpacity } from 'react-native';
import HomeScreen from './homeScreen';
import MyJobsProfessional from '../src/screens/myJobs/myJobs';
import ChatListPage from '../src/screens/chat/chatListPage';
import SettingsPage from '../src/screens/settingsPage/settingsPage';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function ProfessionalNavBar({ setIsLoggedIn }) {  // Receive setIsLoggedIn as a prop
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                }
                else if (route.name === 'CurrentJobs') {
                    iconName = focused ? 'hammer' : 'hammer-outline';
                }

                else if (route.name === 'Chat') {
                    iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                }
                else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'orange',
            tabBarInactiveTintColor: 'gray',
        })}
        >
            {/* Pass setIsLoggedIn to HomeScreen */}
            <Tab.Screen name="Home">
                {props => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Tab.Screen>

            {/* Current Jobs Tab */}
            <Tab.Screen
                name="CurrentJobs"
                component={MyJobsProfessional}
            />

            {/* Chat Tab - Intercept press and show alert */}
            <Tab.Screen
                name="Chat"
                component={ChatListPage}
            />

            {/* Settings Tab - Intercepts press to show alert */}
            <Tab.Screen
                name="Settings"
                component={SettingsPage}
                options={{ headerShown: false}}
            />
        </Tab.Navigator>
    );
}
