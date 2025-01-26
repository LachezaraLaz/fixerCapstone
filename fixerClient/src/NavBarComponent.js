import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, TouchableOpacity } from 'react-native';
import HomeScreen from './homeScreen';
import CreateIssue from './screens/createIssue/createIssue';
import MyIssuesPosted from "./screens/myIssuesPosted/myIssuesPosted";
import ChatListPage from '../src/screens/chat/chatListPage';
import Ionicons from '@expo/vector-icons/Ionicons';
import SettingsPage from '../src/screens/settingsPage/settingsPage';

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

            {/* Chat Tab - Intercept press and show alert */}
            <Tab.Screen
                name="Chat"
                component={ChatListPage}
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
