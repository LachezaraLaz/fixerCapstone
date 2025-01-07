import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, TouchableOpacity } from 'react-native';
import HomeScreen from './homeScreen';
import MyJobsProfessional from '../src/screens/myJobs/myJobs';
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
            tabBarActiveTintColor: 'blue',
            tabBarInactiveTintColor: 'gray',
        })}
        >
            {/* Pass setIsLoggedIn to HomeScreen */}
            <Tab.Screen name="Home">
                {props => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Tab.Screen>

            {/* Current Jobs Tab - Intercept press and show alert */}
            <Tab.Screen
                name="CurrentJobs"
                component={MyJobsProfessional} // Use the new component here
            />

            {/* Chat Tab - Intercept press and show alert */}
            <Tab.Screen
                name="Chat"
                component={HomeScreen}
                options={{
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...props}
                            onPress={() => Alert.alert("Sorry, this feature isn't available yet.")}
                        />
                    ),
                }}
            />

            {/* Settings Tab - Intercepts press to show alert */}
            <Tab.Screen
                name="Settings"
                component={HomeScreen}
                options={{
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...props}
                            onPress={() => Alert.alert("Sorry, this feature isn't available yet.")}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
