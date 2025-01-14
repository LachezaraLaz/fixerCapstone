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
import NavBar from './src/NavBarComponent';
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';
import { chatApiKey, chatUserId, chatUserName, chatUserToken } from './src/screens/chat/chatConfig';
import { StreamChat } from "stream-chat";
import { ChatProvider } from "./src/screens/chat/chatContext";
import ChatListPage from "./src/screens/chat/chatListPage";

import { Text } from "react-native";

const Stack = createNativeStackNavigator();
const chatClient = StreamChat.getInstance(chatApiKey);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // Stream Chat Client Initialization
    const user = {
        id: chatUserId,
        name: chatUserName,
    };

    const chatClient = useCreateChatClient({
        apiKey: chatApiKey,
        userData: user,
        tokenOrProvider: chatUserToken,
    });

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                console.log(token);
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
                <ChatProvider>
                    <OverlayProvider>
                        <Chat client={chatClient}>
                            <NavigationContainer>
                                <Stack.Navigator initialRouteName={isLoggedIn ? "MainTabs" : "welcomePage"}>
                                    {isLoggedIn ? (
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
                                            <Stack.Screen name="ChatListPage" component={ChatListPage} />
                                        </>
                                    ) : (
                                        <>
                                            {/* Screens accessible when the user is not logged in */}
                                            <Stack.Screen name="welcomePage" component={WelcomePage} />
                                            <Stack.Screen name="SignInPage">
                                                {props => <SignInPage {...props} setIsLoggedIn={setIsLoggedIn} />}
                                            </Stack.Screen>
                                            <Stack.Screen name="SignUpPage" component={SignUpPage} />
                                        </>
                                    )}
                                </Stack.Navigator>
                            </NavigationContainer>
                        </Chat>
                    </OverlayProvider>
                </ChatProvider>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
