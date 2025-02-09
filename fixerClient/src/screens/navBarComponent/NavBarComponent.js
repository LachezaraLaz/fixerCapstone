import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../homeScreen/homeScreen';
import MyIssuesPosted from "../myIssuesPosted/myIssuesPosted";
import ChatScreens from '../chat/chatScreens';
import { Ionicons } from '@expo/vector-icons';
import SettingsPage from '../settingsPage/settingsPage';

const Tab = createBottomTabNavigator();

export default function NavBar({ setIsLoggedIn }) {
    // Map route names to custom display names
    const labels = {
        Home: 'Home',
        JobsPosted: 'My Jobs',
        Chat: 'Chat',
        Settings: 'Profile',
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'JobsPosted') {
                        iconName = 'briefcase';
                    } else if (route.name === 'Chat') {
                        iconName = 'chatbubble';
                    } else if (route.name === 'Settings') {
                        iconName = 'person';
                    }

                    return (
                        <View
                            style={[
                                styles.iconContainer,
                                focused && styles.activeTab, // Apply active styles when focused
                            ]}
                        >
                            <Ionicons
                                name={focused ? iconName : `${iconName}-outline`}
                                size={size}
                                color={focused ? 'orange' : 'gray'}
                            />
                            {focused && (
                                <Text style={styles.tabLabel}>
                                    {labels[route.name]} {/* Display custom label */}
                                </Text>
                            )}
                        </View>
                    );
                },
                tabBarShowLabel: false, // Disable default text labels
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
                    paddingRight: 10
                },
                headerShown: false, // Hide the header for each tab
            })}
        >
            <Tab.Screen name="Home">
                {props => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Tab.Screen>
            <Tab.Screen name="JobsPosted" component={MyIssuesPosted} />
            <Tab.Screen name="Chat" component={ChatScreens} />
            <Tab.Screen name="Settings" component={SettingsPage} />
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
