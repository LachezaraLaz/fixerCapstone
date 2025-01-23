import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DetailsScreen from "./src/detailsScreen";
import ProfilePage from "./src/profilePage";
import CreateIssue from './src/screens/createIssue/createIssue';
import HomeScreen from "./src/homeScreen";
import MyIssuesPosted from "./src/screens/myIssuesPosted/myIssuesPosted";
import EditIssue from './src/screens/editIssue/editIssue';
import WelcomePage from "./src/screens/welcome/welcomePage";
import SignInPage from "./src/screens/signin/signinPage";
import SignUpPage from "./src/screens/signup/signupPage";
import NotificationPage from "./src/screens/notificationPage/notificationPage";
import NotificationDetail from "./src/screens/notificationDetail/notificationDetail";
import OffersPage from './src/screens/OffersPage/OffersPage';
import NavBar from './src/NavBarComponent';
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';
import { STREAM_API_KEY } from './src/screens/chat/chatConfig';
import { StreamChat } from "stream-chat";
import { ChatProvider } from "./src/screens/chat/chatContext";
import ChatListPage from "./src/screens/chat/chatListPage";
import ChatPage from "./src/screens/chat/chatPage";
import addReview from "./src/screens/addReview/addReview";

import { Text } from "react-native";

const Stack = createNativeStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [chatClient, setChatClient] = useState(null);

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

    // Initialize the StreamChat client
    useEffect(() => {
        const initChatClient = async () => {
            try {
                // Use your public API key here
                const client = StreamChat.getInstance(STREAM_API_KEY);
                setChatClient(client);
            } catch (err) {
                console.log("Error creating StreamChat client:", err);
            }
        };

        initChatClient();
    }, []);

    // Show loading screen if chat client is not ready or token check is in progress
    if (loading || !chatClient) {
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
                                <OverlayProvider>
                                    <Chat client={chatClient}>
                                        <Stack.Navigator initialRouteName={isLoggedIn ? 'MainTabs' : 'welcomePage'}>
                                        <>
                                            {/* MainTabs with NavBar as the default screen */}
                                            <Stack.Screen
                                                name="MainTabs"
                                                options={{ headerShown: false }}
                                            >
                                                {props => <NavBar {...props} setIsLoggedIn={setIsLoggedIn} />}
                                            </Stack.Screen>


                                            {/* Additional screens accessible from MainTabs */}
                                            <Stack.Screen
                                                name="HomeScreen"
                                                options={{ headerShown: false }} // Remove header for HomeScreen
                                            >
                                                {props => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                                            </Stack.Screen>
                                            <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
                                            <Stack.Screen name="ProfilePage" component={ProfilePage} />
                                            <Stack.Screen name="CreateIssue" component={CreateIssue} />
                                            <Stack.Screen name="MyIssuesPosted" component={MyIssuesPosted} />
                                            <Stack.Screen name="EditIssue" component={EditIssue} />
                                            <Stack.Screen name="NotificationPage" component={NotificationPage} />
                                            <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
                                            <Stack.Screen name="OffersPage" component={OffersPage} />
                                            <Stack.Screen name="ChatListPage" component={ChatListPage} />
                                            <Stack.Screen name="ChatPage" component={ChatPage} />
                                            <Stack.Screen name="addReview" component={addReview} />
                                        </>

                                            </Stack.Navigator>
                                    </Chat>
                                </OverlayProvider>
                            </ChatProvider>
                        ) : (
                            <Stack.Navigator initialRouteName={isLoggedIn ? 'MainTabs' : 'welcomePage'}>
                            <>
                                {/* Screens accessible when the user is not logged in */}
                                <Stack.Screen name="welcomePage" component={WelcomePage} />
                                <Stack.Screen name="SignInPage">
                                    {props => <SignInPage {...props} setIsLoggedIn={setIsLoggedIn} />}
                                </Stack.Screen>
                                <Stack.Screen name="SignUpPage" component={SignUpPage} />
                            </>

                                </Stack.Navigator>
                        )}
                </NavigationContainer>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
