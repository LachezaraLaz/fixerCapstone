import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../src/screens/homeScreen/homeScreen';
import MyJobsProfessional from '../src/screens/myJobs/myJobs';
import ChatScreens from './screens/chat/chatScreens';
import { Ionicons } from '@expo/vector-icons';
import ProfilePage from './screens/profilePage/profilePage';

const Tab = createBottomTabNavigator();

export default function NavBar({ setIsLoggedIn }) {
    const labels = {
        Home: 'Home',
        CurrentJobs: 'Jobs',
        Chat: 'Chat',
        Profile: 'Profile',
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'CurrentJobs':
                            iconName = focused ? 'briefcase' : 'briefcase-outline';
                            break;
                        case 'Chat':
                            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: 'orange',  // Active icon color
                tabBarInactiveTintColor: 'gray',  // Inactive icon color
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    position: 'absolute',
                    height: 70,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6.27,
                    elevation: 10,
                    paddingBottom: 10,
                    paddingLeft: 10,
                    paddingRight: 10,
                },
                headerShown: false,
            })}
        >
        <Tab.Screen name="Home">
                {props => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Tab.Screen>
            <Tab.Screen name="CurrentJobs" component={MyJobsProfessional} />
            <Tab.Screen name="Chat" component={ChatScreens} />
            <Tab.Screen name="Profile" component={ProfilePage} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    activeTab: {
        backgroundColor: '#ffe5cc',
        paddingHorizontal: 15,
    },
    tabLabel: {
        marginLeft: 8,
        fontSize: 12,
        fontWeight: 'bold',
        color: 'orange',
    },
});