import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DetailsScreen from "./src/screens/detailsScreen/detailsScreen";
import ProfilePage from "./src/screens/profilPage/profilePage";
import CreateIssue from './src/screens/createIssue/createIssue';
import HomeScreen from "./src/screens/homeScreen/homeScreen";
import MyIssuesPosted from "./src/screens/myIssuesPosted/myIssuesPosted";
import EditIssue from './src/screens/editIssue/editIssue';
import SettingsPage from './src/screens/settingsPage/settingsPage';
import WelcomePage from "./src/screens/welcome/welcomePage";
import SignInPage from "./src/screens/signin/signinPage";
import SignUpPage from "./src/screens/signup/signupPage";
import NotificationPage from "./src/screens/notificationPage/notificationPage";
import NotificationDetail from "./src/screens/notificationDetail/notificationDetail";
import OffersPage from './src/screens/OffersPage/OffersPage';
import NavBar from './src/screens/navBarComponent/NavBarComponent';
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatProvider } from "./src/screens/chat/chatContext";
import addReview from "./src/screens/addReview/addReview";

import { Text } from "react-native";

const Stack = createNativeStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    setIsLoggedIn(true);
                }
            } catch (e) {
                console.log("Failed to fetch the token");
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, []);

    // Show loading screen if chat client is not ready or token check is in progress
    if (loading) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading app...</Text>
                </SafeAreaView>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <NavigationContainer>
                    {isLoggedIn ? (
                        <ChatProvider>
                            <Stack.Navigator initialRouteName={isLoggedIn ? "MainTabs" : "welcomePage"}>
                                <Stack.Screen name="MainTabs">
                                    {props => <NavBar {...props} setIsLoggedIn={setIsLoggedIn} />}
                                </Stack.Screen>

                                {/* Screens when user is NOT logged in */}
                                {!isLoggedIn && (
                                    <>
                                        <Stack.Screen name="welcomePage" component={WelcomePage}/>
                                        <Stack.Screen name="SignInPage">
                                            {props => <SignInPage {...props} setIsLoggedIn={setIsLoggedIn}  />}
                                        </Stack.Screen>
                                        <Stack.Screen name="SignUpPage" component={SignUpPage} />
                                    </>
                                )}

                                {/* Screens when user IS logged in */}
                                {isLoggedIn && (
                                    <>
                                        <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
                                        <Stack.Screen name="ProfilePage" component={ProfilePage} options={{ headerShown: false }} />
                                        <Stack.Screen name="CreateIssue" component={CreateIssue} />
                                        <Stack.Screen name="SettingsPage" component={SettingsPage} />
                                        <Stack.Screen name="MyIssuesPosted" component={MyIssuesPosted} />
                                        <Stack.Screen name="EditIssue" component={EditIssue} />
                                        <Stack.Screen name="NotificationPage" component={NotificationPage} />
                                        <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
                                        <Stack.Screen name="OffersPage" component={OffersPage} />
                                        <Stack.Screen name="addReview" component={addReview} />
                                    </>
                                )}
                            </Stack.Navigator>
                        </ChatProvider>
                    ) : (
                        <Stack.Navigator initialRouteName={isLoggedIn ? 'MainTabs' : 'welcomePage'}>
                            <>
                                {/* Screens accessible when the user is not logged in */}
                                <Stack.Screen name="welcomePage" component={WelcomePage} options={{ headerShown: false }}/>
                                <Stack.Screen name="SignInPage" options={{ headerShown: false }}>
                                    {props => <SignInPage {...props} setIsLoggedIn={setIsLoggedIn} />}
                                </Stack.Screen>
                                <Stack.Screen name="SignUpPage" component={SignUpPage} options={{ headerShown: false }}/>
                            </>

                        </Stack.Navigator>
                    )}
                </NavigationContainer>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
