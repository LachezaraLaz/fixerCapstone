import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Alert, TouchableOpacity} from 'react-native';
import HomeScreen from './homeScreen';
import CreateIssue from './screens/createIssue/createIssue';
import MyIssuesPosted from "./screens/myIssuesPosted/myIssuesPosted";
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function NavBar() {
    return (
        <Tab.Navigator  screenOptions={({ route }) => ({
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
                    iconName = focused ? 'chat' : 'chatbubble-outline';
                }
                else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'blue',   // Color for active tab
            tabBarInactiveTintColor: 'gray',   // Color for inactive tab
        })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="JobsPosted" component={MyIssuesPosted} />
            <Tab.Screen name="CreateIssue" component={CreateIssue} />

            {/* Chat Tab - Intercept press and show alert */}
            <Tab.Screen
                name="Chat"
                component={HomeScreen} // So it doesn't navigate to screen
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
                component={HomeScreen} // So it doesn't navigate to screen
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
