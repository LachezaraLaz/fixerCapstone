import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, TouchableOpacity } from 'react-native';
import HomeScreen from '../homeScreen/homeScreen';
import CreateIssue from '../createIssue/createIssue';
import MyIssuesPosted from "../myIssuesPosted/myIssuesPosted";
import ChatScreens from '../chat/chatScreens'
import { Ionicons } from '@expo/vector-icons';
import SettingsPage from '../settingsPage/settingsPage';

const Tab = createBottomTabNavigator();

export default function NavBar({ setIsLoggedIn }) {  // Receive setIsLoggedIn as a prop
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'JobsPosted') {
                    iconName = focused ? 'hammer' : 'hammer-outline';
                }
                else if (route.name === 'CreateIssue') {
                    iconName = focused ? 'add' : 'add-outline';
                }
                else if (route.name === 'Chat') {
                    iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                }
                else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'blue',
            tabBarInactiveTintColor: 'gray',
        })}
        >
            {/* Pass setIsLoggedIn to HomeScreen */}
            <Tab.Screen name="Home">
                {props => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Tab.Screen>
            <Tab.Screen name="JobsPosted" component={MyIssuesPosted} />
            <Tab.Screen name="CreateIssue" component={CreateIssue} />

            <Tab.Screen
                name="Chat"
                component={ChatScreens}
            />

            {/* Settings Tab - Intercepts press to show alert */}
            <Tab.Screen name="Settings"
                        component={SettingsPage}
                        options={{ headerShown: false }}
            />
        </Tab.Navigator>
    );
}
